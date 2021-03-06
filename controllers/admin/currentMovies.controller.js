/**
 * Created by swapnil on 18/02/18.
 */
'use strict';
import * as mysqlDetails from '../../database/connectMySQL';
import * as utils from '../../services/utils.service';
import moment from 'moment';
const kimController = require('../kidsInMind/kidsInMind.controller');

const rottenTomatoes = require('../rottenTomatoes/rottenTomatoes.controller');


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
					// Sorting time
					for (let i =0 ;i<rows.length;i++) {
						if (rows[i].movieShowDate && rows[i].movieStartTime) {
                            rows[i].epochTime = moment(new Date(rows[i].movieShowDate +' '+rows[i].movieStartTime)).valueOf();
						}
                        rows[i].movieStartTime = moment(rows[i].movieStartTime, ['HH:mm']).format('hh:mm A');
                        rows[i].movieEndTime = moment(rows[i].movieEndTime, ['HH:mm']).format('hh:mm A');
                        rows[i].movieShowDate = moment(new Date(rows[i].movieShowDate)).format('MM/DD/YYYY');
					}
                    rows.sort(function (a, b) {
                        return a.epochTime - b.epochTime;
                    });

					let tempRows = rows.filter(function (item) {
						return item.epochTime > moment().endOf('day').subtract(1, 'days').valueOf();
                    });
					rows = tempRows;

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
		return next({message: utils.jsonResponse(checkReqBody.message)});
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
	let mandatoryFields = ['scheduleID'];
	let checkReqBody = utils.checkMandatoryRequestBody(req.params, mandatoryFields);
	if (checkReqBody.message !== 'success') {
		return next({message: utils.jsonResponse(checkReqBody.message)});
	}

	mysqlDetails.pool.getConnection(function (err, connection) {
		if (err) {
			next({error: err});
		} else {
			let query = 'DELETE FROM ?? WHERE ??=?';

			let values = ['movie_schedule', 'scheduleID', req.params.scheduleID];
			query = mysqlDetails.mysqlFormat(query, values);
			console.log(query);
			connection.query(query, values, (err, rows) => {
				if (err) {
					next({error: err});
				} else {
					res.json({
						message: 'Successfully deleted showtime',
						data: rows
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
		return next({message: utils.jsonResponse(checkReqBody.message)});
	}

	mysqlDetails.pool.getConnection((err, connection) => {
		if (err) {
			next({error: err});
		} else {
			let query = 'UPDATE ?? SET  ??=?,??=?,??=?,??=?,??=?,??=?';
			let values = ['movie_schedule', 'movieImdbID', req.body.movieImdbID,
				'movieType', req.body.movieType, 'movieScreen', req.body.movieScreen,
				'movieShowDate', req.body.movieShowDate, 'movieStartTime',
				req.body.movieStartTime, 'movieEndTime', req.body.movieEndTime];
			query = mysqlDetails.mysqlFormat(query, values);
			connection.query(query, (err, rows) => {
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
		return next({message: utils.jsonResponse(checkReqBody.message)});
	}

	mysqlDetails.pool.getConnection((err, connection) => {
		if (err) {
			next({error: err});
		} else {
            let tableName = 'movie_schedule';

            let columns = ['movieImdbID', 'movieType',
                'movieScreen', 'movieShowDate', 'movieStartTime',
                'movieEndTime'];

			if (req.body.hasOwnProperty('movieShowDateRepeat')) {
				let tempStart = moment(req.body.movieShowDate + ' ' + req.body.movieStartTime).valueOf();
				let tempEndDate = moment(req.body.movieShowDateRepeat + ' ' + req.body.movieStartTime).valueOf();
				let add1day = 24 * 3600 * 1000;
				let valuesArr = [];
				let tempTime = tempStart;
				while (tempTime <= tempEndDate) {
					let t = [req.body.movieImdbID, req.body.movieType,
                        req.body.movieScreen, moment(tempTime).format('YYYY-MM-DD'),
                        req.body.movieStartTime, req.body.movieEndTime];
					valuesArr.push(t);
                    tempTime = tempTime + add1day;
				}

				let query  = 'INSERT INTO ' + tableName + ' ' +
					'(movieImdbID, movieType, movieScreen, movieShowDate, ' +
					'movieStartTime, movieEndTime) VALUES ?';
				connection.query(query, [valuesArr], (err, rows) => {
					if (err) {
                        next({error: err});
                    } else {
                        res.json({
                            message: 'Successfully added movie showtime',
                            data: rows
                        });
					}
				});
			} else {

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
			}
		}
		connection.release();
	});
};


let addCurrentMovies = (req, res, next) => {
	// Check for mandatory fields
	let mandatoryFields = ['id', 'imdb_id', 'title', 'released',
		'runtime', 'rated', 'director', 'writer', 'genre', 'imdbRating', 'production',
		'website', 'plot', 'poster_path', 'cast', 'boxOffice'];
	let checkReqBody = utils.checkMandatoryRequestBody(req.body, mandatoryFields);
	if (checkReqBody.message !== 'success') {
		return next({message: utils.jsonResponse(checkReqBody.message)});
	}

	mysqlDetails.pool.getConnection((err, connection) => {
		if (err) {
			next({error: err});
		} else {
			let tableName = 'admin_movieinfo';

			let columns = ['infoMovieID', 'infoImdbID', 'infoMovieName',
				'infoMovieInTheatres', 'infoMovieRuntime', 'infoMovieRated',
				'infoMovieDirectedBy', 'infoMovieWrittenBy', 'infoMovieGenre',
				'infoMovieImdbRating', 'infoMovieProduction', 'infoMovieWebsite',
				'infoMovieDescription', 'infoMoviePosterPath', 'infoMovieCasts',
				'infoMovieBoxOffice', 'infoMovieBackdropPath'];

			let values = [req.body.id, req.body.imdbID, req.body.title,
				req.body.released, req.body.runtime, req.body.rated,
				req.body.director, req.body.writer, req.body.genre,
				req.body.imdbRating, req.body.production, req.body.website,
				req.body.plot, '/images/nowShowing' + req.body.poster_path, req.body.cast,
				req.body.boxOffice, req.body.backdrop_path];

			utils.insertToDB(tableName, columns, values)
				.then((success) => {
					res.json({
						message: 'Successfully added movie to current',
						data: success.data
					});
				}, (errResponse) => {
					next({error: errResponse.error});
				});
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
	addMovieSchedule: addMovieSchedule,
	addCurrentMovies: addCurrentMovies
};
