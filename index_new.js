'use strict';
// client side

var BASE_DIR = process.cwd();
var express = require('express');
var path = require('path');
// Setup server
var app = express();
app.use(express.static(path.join(BASE_DIR, 'src')));
app.use(express.static(path.join(BASE_DIR, '.tmp')));
app.get('*', function (req, res) {
    return res.sendFile(path.join(BASE_DIR, 'src', 'index.html'));
});
var server = require('http').createServer(app);
server.listen(5555, function () {
    console.log('Express server listening on at port 5555');
});


// sync side
var moment = require('moment-timezone');
var async = require('async');
var asyncLoop = require('node-async-loop');
var _ = require('lodash');
var fs = require('fs');
var decompress = require('decompress');
var Sequelize = require('sequelize');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var cron = require('node-cron');
mongoose.Promise = Promise;
var models = {};
var Schema = mongoose.Schema;
var StationSchema = new Schema({
    _class: {
        type: String,
        default: 'tdsoft.rms.system.model.MeteorologicalStation'
    },
    areaCode: String,
    stationCode: String,
    stationName: String,
    coordinates: [],
    province: String,
    sensor: Number,
    isActive: {
        type: Boolean,
        default: true
    }
}, {collection: 'meteorologicalStation'});


var Station = mongoose.model('Station', StationSchema);
var infoSchema = new Schema({
    _class: {
        type: String,
        default: 'tdsoft.rms.system.model.MeteorologicalInfo'
    },
    stationCode: String,
    date: Date,
    infos: [],
    t: {
        type: Number,
        default: 0
    },
    syncId: Number
}, {collection: 'meteorologicalInfo'});
var Info = mongoose.model('Info', infoSchema);

var configSchema = new Schema({
    _class: {
        type: String,
        default: 'tdsoft.rms.system.model.SystemConfiguration'
    },
    onOffWebsite: {
        type: Boolean
    },
    cronTrigger: String,
    serverPort: Number,
    serverIp: String,
    dbUsername: String,
    dbPassword: String,
    onOffSync: {
        type: Boolean
    }
}, {collection: 'systemConfiguration'});
var Configuration = mongoose.model('Config', configSchema);


var mongoConnect = function () {
    return mongoose.connect('mongodb://103.27.239.236:27017/rms_system?connectTimeoutMS=300000', {
        user: 'rms_db_admin',
        pass: 'Aa1234!@#$qwer',
        auth: {
            authdb: 'admin'
        }
    });
};

var showError = function (err) {
    console.log(err);
    process.exit(0);
};


async.waterfall([
    // connect to mongodb
    function (cb) {
        mongoConnect();
        // load configs to connect mysql
        Configuration.find().then(function (configs) {
            cb(null, configs[0]);
        }, function (err) {
            return showError(err);
        });
    },
    // connect to mysql by config
    function (config, cb) {
        console.log(config.dbUsername);
        console.log(config.dbPassword);
        console.log(config.serverIp);
        console.log(config.serverPort);

        var reconnectOptions = {
            max_retries: 999,
            onRetry: function (count) {
                console.log("connection lost, trying to reconnect (" + count + ")");
            }
        };

        var sequelize = new Sequelize('autostation', config.dbUsername, config.dbPassword, {
            host: config.serverIp,
            port: config.serverPort,
            dialect: 'mysql',
            pool: {max: 50, min: 0, idle: 1000000},
            logging: function (arg) {
                //console.log("Sequelize: " + arg);
            },
            dialectOptions: {
                insecureAuth: true
            },
            reconnect: reconnectOptions || true
        });

        models.sequelize = sequelize;
        models.Sequelize = Sequelize;

        if (true) {
            models.sequelize.authenticate().then(function (err) {
                if (err) {
                    return console.log('--> Mysql failed to connect:', err);
                }
                console.log('Connect to mysql successful!, stating to sync..');

                cb(null, config);
            });
        } else {
            return console.log('Configuration onOffSync is false');
        }

    }
], function (err, config) {
    var MySQLStation = models.sequelize.define('MySQLStation', {}, {tableName: 'stationfile'});

    var numFmt = function (num, mark) {
        return (mark + num).slice(-Math.max(mark.length, (num + '').length));
    };

    //fucntion StoreData
    var storeData = function (station, info) {
        var buffers = info.get('Data');
        decompress(buffers).then(function (data) {
            var buffer = data[0].data;
            var headerSize = 1440;

            var readData = function (start) {
                var length = station.sensor;
                var data = [];
                for (var i = 0; i < length; i++) {
                    var j = i * 2 + start;
                    var buff = new Buffer([buffer[j + 1], buffer[j]]);
                    data.push(buff.readInt16BE());
                }
                return data;
            };
            var year = info.get('Year');
            var month = parseInt(info.get('Month')) - 1;
            var date = info.get('Day');
            // console.log('Read data on ' + [date, info.get('Month'), year].join('-') + ' of station with code ' + station.stationCode);
            var newInfos = [];
            for (var i = 0; i < headerSize; i++) {
                var j = i * 4;
                var buff = new Buffer([buffer[j + 3], buffer[j + 2], buffer[j + 1], buffer[j]]);
                var startAt = buff.readUInt32BE();
                if (startAt > headerSize && startAt < buffer.length) {
                    var data = readData(startAt);
                    var newData = _.map(data, function (value) {
                        return {
                            name: '',
                            value: value
                        }
                    });
                    var inf = new Info({
                        stationCode: station.stationCode,
                        syncId: info.get('id'),
                        infos: newData,
                        date: moment().year(year).month(month).date(date).hours(Math.floor(i / 60)).minutes(i % 60).toDate()
                    });
                    newInfos.push(inf);
                }
            }
            // asyncLoop(newInfos, function (item, next) {
            //     item.save().then(function () {
            //
            //     }, function () {
            //     });
            //     next();
            // }, function (err) {
            //     if (err) {
            //         fs.appendFile('sync_log', "Save data in station " + station.stationCode + ' - Error: ' + err.message
            //             , function (err) {
            //             });
            //     }
            //     fs.appendFile('sync_log', "Saved data in station " + station.stationCode + " completed!"
            //         , function (err) {
            //         });
            // });

            console.log("Start import into mongodb");
            // async.map(newInfos, function (inf, __cb) {
            //     console.log("Fuck you saving!");
            //     inf.save().then(function () {
            //         console.log("Save item successfully!");
            //         return __cb(null, true);
            //     }, function () {
            //         console.log("Save item error!");
            //         return __cb(null, false);
            //     });
            // });

            // async.forEach(newInfos, function (item, callback) {
            //     item.save().then(function () {
            //         return callback(null, true);
            //     }, function () {
            //         return callback(null, false);
            //     });
            //
            //     // tell async that the iterator has completed
            // }, function (err) {
            //     console.log('iterating storeData done');
            // });

            for (var i = 0; i < newInfos.length; i++) {
                newInfos[i].save().then(function () {
                    console.log("Save item successfully!");
                }, function () {
                    console.log("Save item error!");
                });
            }
        });
    };

    //function callback
    var syncInfo = function (station) {
        console.log("Syncing info of station " + station.stationCode);
        var modelName = ['st', numFmt(parseInt(station.stationCode), '0000')].join('_');

        // Unit test
        // if (modelName == "st_1032") {
        //     return null;
        // }

        var model = models.sequelize.define(modelName, {}, {
            tableName: modelName,
            timestamps: false
        });
        model.findAll({
            attributes: ['id', 'Data', 'Year', 'Month', 'Day'],
            order: 'id ASC'
        }).then(function (infos) {
            console.log("Start syncing " + station.stationCode + " with " + infos.length + " records");
            if (!infos.length) {
                console.log(station.stationCode + " is null");
                return null;
            }

            // asyncLoop(infos, function (item, next) {
            //     storeData(station, item, function (err) {
            //         if (err) {
            //             next(err);
            //         }
            //         next();
            //     });
            //
            // }, function (err) {
            //     if (err) {
            //         console.log(err);
            //     }
            //     console.log("Fuck off, it's continue");
            // });

            async.forEach(infos, function (item, callback) {
                storeData(station, item, function () {
                    return callback(null, true);
                });
            }, function (err) {
                console.log('iterating syncinfo done');
            });

            // for (var k = 0; k < infos.length; k++) {
            //     storeData(station, infos[k]);
            // }
            console.log("Fuck Fuck Finished sync " + station.stationCode);
        }, function (err) {
            console.log(err);
            if (err && err.parent.code && err.parent.code == 'ER_NO_SUCH_TABLE') {
                cb(null, 'Table ' + modelName + ' not exists');
            } else {
                return showError(err);
            }
        });
    };

    //function sync
    // var syncInfo = function (station) {
    //     callback(station);
    // };

    var syncMYSQLtoMongo = function () {
        MySQLStation.findAll({
            raw: true,
            where: {type: 1},
            attributes: ['IdStation', 'Name', 'Lat', 'Lon', 'Sensor']
        }).then(function (results) {
            if (results.length) {
                var syncStations = function (st, cb) {
                    var data = st;
                    Station.findOne({stationCode: st.IdStation}).then(function (station) {
                        if (!station) {
                            station = new Station();
                        }
                        if (!data.Lon && !data.Lat) {
                            // set lat & lon of HCM
                            data.Lon = '106.633';
                            data.Lat = '10.8009';
                        }
                        station.stationCode = data.IdStation;
                        station.stationName = data.Name;
                        station.sensor = data.Sensor;
                        station.coordinates = [data.Lon || '', data.Lat || ''];
                        station.save().then(function (saved) {
                            return cb(null, saved);
                        }, function (err) {
                            console.log(err);
                            return cb(null);
                        });
                    }, function (err) {
                        console.log(err);
                        return cb(null);
                    });
                };
                async.map(results, syncStations, function (err, data) {
                    if (err) {
                        fs.appendFile('sync_log', "Sync stations fail!", function (err) {
                            console.log(err);
                        });
                        return;
                    }
                    _.remove(data, function (d) {
                        return !d;
                    });

                    console.log('Synced ' + data.length + ' stations');
                    console.log("Loop sync");

                    // for (var i = 0; i < data.length; i++) {
                    //     syncInfo(data[i], function (err) {
                    //         if (err) {
                    //             console.log("An error stop sync thread 1");
                    //         }
                    //
                    //         console.log("Fuck off next");
                    //     });
                    // }

                    // asyncLoop(data, function (item, next) {
                    //     console.log("Syncing station " + item.stationCode);
                    //     syncInfo(item, function (err) {
                    //         if (err) {
                    //             console.log("An error stop sync thread 1");
                    //             next(err);
                    //             return;
                    //         }
                    //
                    //         console.log("Fuck off next");
                    //     });
                    //     next();
                    //
                    // }, function (err) {
                    //     if (err) {
                    //         console.error(err.message);
                    //         return;
                    //     }
                    //     console.log('-- Fuck Finished!');
                    // });

                    async.forEach(data, function (item, callback) {
                        syncInfo(item, function () {
                            return callback(null, true);
                        })
                    }, function (err) {
                        console.log('iterating done');
                    });
                });
                console.log("-- Get out of my mySQL!");
            }
        }, showError);
    }

    var runCronTrigger = function (cronTrigger) {
        var cronTrigger = cronTrigger;
        if (cronTrigger) {
            cronTrigger = cronTrigger.replace('?', '*');
            cron.schedule(cronTrigger, function () {
                console.log('syncing by cronJob ' + cronTrigger);
                syncMYSQLtoMongo();
            });
        }
    }


    syncMYSQLtoMongo();
    // run cron job
    var cronTrigger = config.cronTrigger;
    //runCronTrigger(cronTrigger);
});


// Expose app
exports = module.exports = app;
