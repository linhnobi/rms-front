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
    // return mongoose.connect('mongodb://103.27.239.201:27017/rms_system_dev?connectTimeoutMS=300000', {
    //     //  http://103.27.239.201:8080/rms-system/services/
    //     user: 'rms_db_admin',
    //     pass: 'Aa1234!@#$qwer',
    //     auth: {
    //         authdb: 'admin'
    //     }
    // });
};

var showError = function (err) {
    console.log(err);
    process.exit(0);
};

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

setTimeout(function () {
    console.log('This will still run.');
}, 500);

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
        var sequelize = new Sequelize('autostation', 'phong', 'phong123', {
            host: config.serverIp,
            port: config.serverPort,
            dialect: 'mysql',
            pool: {max: 5, min: 0, idle: 10000},
            logging: function (arg) {
                //console.log("Sequelize: " + arg);
            },
            dialectOptions: {
                insecureAuth: true
            }
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

    var syncInfo = function (page) {
        page = page || 1;
        var stop = false;
        var currentDate = moment();
        var callback = function (station, cb) {
            console.log("Callback ", station.stationCode);
            if (stop) {
                stop = false;
                return cb(null, 'Stop sync data of station id ' + station.stationCode);
            }
            var modelName = ['st', numFmt(parseInt(station.stationCode), '0000')].join('_');

            // Unit test
            // if (modelName != "st_1040") {
            //     return cb(null, 'Do not sync data of station id ' + station.stationCode);
            // }

            var model = models.sequelize.define(modelName, {}, {
                tableName: modelName,
                timestamps: false
            });

            Info.findOne({
                stationCode: station.stationCode
            }).sort({syncId: 'desc'}).exec(function (err, last) {
                if (err) {
                    return showError(err);
                }
                var lastId = 0;
                if (last) {
                    lastId = last.syncId;
                }

                console.log("Finish remove all documents before sync: ", station.stationCode);

                Info.remove({
                    stationCode: station.stationCode,
                    syncId: lastId
                }).then(function (res) {
                    model.findAll({
                        where: {
                            // ID: 159
                            ID: {gte: lastId},

                        },
                        attributes: ['id', 'Data', 'Year', 'Month', 'Day'],
                        order: 'id ASC'
                    }).then(function (infos) {
                        if (!infos.length) {
                            return cb(null, 'Synced data of station id ' + station.stationCode);
                        }

                        var storeData = function (info, _cb) {
                            var buffers = info.get('Data');
                            decompress(buffers).then(function (data) {
                                var year = info.get('Year');
                                var month = parseInt(info.get('Month')) - 1;
                                var date = info.get('Day');

                                console.log("bao nhieu", currentDate.diff(moment().year(year).month(month).date(date), 'days'));
                                if (currentDate.diff(moment().year(year).month(month).date(date), 'days') == 0) {
                                    stop = true;
                                } else {
                                    currentDate = moment().year(year).month(month).date(date);
                                }
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

                                console.log('Read data on ' + [date, info.get('Month'), year].join('-') + ' of station with code ' + station.stationCode);
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

                                async.map(newInfos, function (inf, __cb) {
                                    inf.save().then(function () {
                                        return __cb(null, true);
                                    }, function () {
                                        return __cb(null, false);
                                    });
                                }, _cb);
                            }).catch(function (exception) {
                                return _cb(null, exception);
                            });

                        };
                        async.mapSeries(infos, storeData, function (err, done) {
                            console.log("Done!");
                            if (err) {
                                return showError(err);
                            }
                            page++;
                            callback(station, cb);
                        });
                    }, function (err) {
                        if (err && err.parent.code && err.parent.code == 'ER_NO_SUCH_TABLE') {
                            cb(null, 'Table ' + modelName + ' not exists');
                        } else {
                            return showError(err);
                        }

                    });
                });

            });
        };
        return callback;
    };

    var syncMYSQLtoMongo = function () {
        MySQLStation.findAll({
            raw: true,
            where: {type: 1},
            attributes: ['IdStation', 'Name', 'Lat', 'Lon', 'Sensor']
        }).then(function (results) {
            console.log("Station length: ", results.length);
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
                async.waterfall([
                    function (cb) {
                        async.map(results, syncStations, function (err, data) {
                            if (err) {
                                return cb(err);
                            }
                            _.remove(data, function (d) {
                                return !d;
                            });
                            return cb(null, data);
                        });
                    },
                    function (stations, cb) {
                        async.mapSeries(stations, syncInfo(1), function (err, messages) {
                            console.log("Map series 1 has stop!");
                            if (err) {
                                return cb(err);
                            }
                            _.each(messages, function (msg) {
                                console.log(msg);
                            });
                            return cb(null, true);
                        });
                    }
                ], function (err) {
                    console.log(err);
                    if (err) {
                        return showError(err);
                    }
                    return true;
                });

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


    // syncMYSQLtoMongo();
    // run cron job
    var cronTrigger = config.cronTrigger;
    // runCronTrigger(cronTrigger);
});


// Expose app
exports = module.exports = app;
