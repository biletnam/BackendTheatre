/**
 * Created by swapnil on 18/02/18.
 */

import * as mysqlDetails from '../../database/connectMySQL';
import * as utils from '../../services/utils.service';

let getCurrentMovies = (req, res, next) => {
    /*Searching from Database*/
    // for time being using this
    // var query = "SELECT * FROM ?? WHERE ??=? AND `upReleaseDate` BETWEEN (CURDATE()) AND (DATE_SUB( CURDATE() ,INTERVAL -20 DAY))";
    let query = 'SELECT * FROM ?? WHERE ?? != ?';
    let table = ['admin_movieinfo', 'infoMovieRuntime', 'N/A'];
    query = mysqlDetails.mysqlFormat(query, table);
    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            next({error: err});
        } else {
            connection.query(query, function (err, rows) {
                if (err) {
                    next({error: err});
                } else {
                    res.json({
                        messgae: 'Successfully fetched current movies',
                        data: rows
                    });
                }
            });
        }
        connection.release();
    });
    /*End searching*/
};


let getMovieSchedule = (req, res, next) => {
    let query = 'SELECT m_s.*,a_m.* FROM ?? as m_s ' +
        'JOIN  ?? as a_m ON m_s.movieImdbID = a_m.infoImdbID';
    let table = ['movie_schedule', 'admin_movieinfo'];
    if (req.params.movieImdbID) {
        query += ' WHERE m_s.movieImdbID = ?';
        table = ['movie_schedule', 'admin_movieinfo', req.params.movieImdbID];
    }
    query = mysqlDetails.mysqlFormat(query, table);
    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            next({error: err});
        } else {
            connection.query(query, function (err, rows) {
                if (err) {
                    next({error: err});
                } else {
                    res.json({
                        message: 'Successfully fetched movie schedule',
                        data: rows
                    });
                }
            });
        }
        connection.release();
    });
};

let getScreens = (req, res, next) => {
    // Check for mandatory fields
    let mandatoryFields = ['screenType'];
    let checkReqBody = utils.checkMandatoryRequestBody(req.params, mandatoryFields);
    if (checkReqBody.message !== 'success') {
        return next({message: checkReqBody.message});
    }

    let query = 'SELECT * FROM ?? WHERE ?? LIKE ?';
    /** @namespace req.params.screenType */
    let table = ['admin_setting_screen', 'screenType', '%' + req.params.screenType + '%'];
    query = mysqlDetails.mysqlFormat(query, table);
    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            next({error: err});
        } else {
            connection.query(query, function (err, rows) {
                if (err) {
                    next({error: err});
                } else {
                    res.json({
                        message: 'Successfully fetched screens',
                        data: rows
                    });
                }
            });
        }
        connection.release();
    });
};

let deleteMovieSchedule = (req, res, next) => {
    // Check for mandatory fields
    let mandatoryFields = ['movieType', 'movieScreen', 'movieShowDate', 'movieStartTime',
        'movieEndTime'];
    let checkReqBody = utils.checkMandatoryRequestBody(req.body, mandatoryFields);
    if (checkReqBody.message !== 'success') {
        return next({message: checkReqBody.message});
    }

    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            next({error: err});
        } else {
            let query = 'DELETE FROM ?? WHERE (??=?) ' +
                'AND (??=?)  AND (??=?)  AND (??=?)  AND (??=?) ';

            let values = ['movie_schedule', 'movieType', req.body.movieType, 'movieScreen',
                req.body.movieScreen, 'movieShowDate', req.body.movieShowDate,
                'movieStartTime', req.body.movieStartTime, 'movieEndTime',
                req.body.movieEndTime
            ];
            query = mysqlDetails.mysqlFormat(query, values);
            connection.query(query, values, (err, rows) => {
                    if (err) {
                        next({error: err});
                    } else {
                        res.json({
                            message: 'Successfully deleted showtime',
                            data:rows
                        });
                    }
                });
        }
        connection.release();
    });
};

let updateMovieSchedule = (req, res, next) => {
    // Check for mandatory fields
    let mandatoryFields = ['movieImdbID', 'movieType', 'movieScreen', 'movieShowDate',
        'movieStartTime', 'movieEndTime'];
    let checkReqBody = utils.checkMandatoryRequestBody(req.body, mandatoryFields);
    if (checkReqBody.message !== 'success') {
        return next({message: checkReqBody.message});
    }

    mysqlDetails.pool.getConnection( (err, connection) => {
        if (err) {
            next({error: err});
        } else {
            let query = 'UPDATE ?? SET  ??=?,??=?,??=?,??=?,??=?,??=?';
            let values = ['movie_schedule', 'movieImdbID', req.body.movieImdbID,
                'movieType', req.body.movieType, 'movieScreen', req.body.movieScreen,
                'movieShowDate', req.body.movieShowDate, 'movieStartTime',
                req.body.movieStartTime, 'movieEndTime', req.body.movieEndTime];
            query = mysqlDetails.mysqlFormat(query, values);
            connection.query(query,  (err, rows) => {
                    if (err) {
                        next({error: err});
                    } else {
                        res.json({
                            message: 'Successfully updated the movie showtime',
                            data: rows
                        });
                    }
                });
        }
        connection.release();
    });
};

let addMovieSchedule = (req, res, next) => {
    // Check for mandatory fields
    let mandatoryFields = ['movieImdbID', 'movieType', 'movieScreen', 'movieShowDate',
        'movieStartTime', 'movieEndTime'];
    let checkReqBody = utils.checkMandatoryRequestBody(req.body, mandatoryFields);
    if (checkReqBody.message !== 'success') {
        return next({message: checkReqBody.message});
    }

    mysqlDetails.pool.getConnection( (err, connection) => {
        if (err) {
            next({error: err});
        } else {
            let tableName = 'movie_schedule';

            let columns = ['movieImdbID', 'movieType',
                'movieScreen', 'movieShowDate', 'movieStartTime',
                'movieEndTime'];

            let values = [req.body.movieImdbID, req.body.movieType,
                req.body.movieScreen, req.body.movieShowDate,
                req.body.movieStartTime, req.body.movieEndTime];

            let result = utils.insertToDB(tableName, columns, values)
                .then((success) => {
                    res.json({
                        message: 'Successfully added movie showtime',
                        data: success.data
                    });
                }, (errResponse) => {
                    next({error: errResponse.error});
                });

            if (result.hasOwnProperty('error')) {
                next({error: err});
            } else if (result.hasOwnProperty('data')) {
                res.json({
                    message: 'Successfully added movie showtime',
                    data: result.data
                });
            }

            // reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/viewer/add-movies/' + req.body.movieImdbID)
            //     .then(function (response) {
            //         // res.json(response);
            //     });
            // reqPro('http://' + configJson.localhost + ':' + configJson.sitePort + '/api/db/viewer/add-movie-tomatoes/' + req.body.movieImdbID)
            //     .then(function (response) {
            //         // res.json(response);
            //     });
        }
        connection.release();
    });
};

module.exports = {
    getCurrentMovies: getCurrentMovies,
    getMovieSchedule: getMovieSchedule,
    getScreens: getScreens,
    deleteMovieSchedule: deleteMovieSchedule,
    updateMovieSchedule: updateMovieSchedule,
    addMovieSchedule: addMovieSchedule
};
