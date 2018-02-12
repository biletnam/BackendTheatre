/**
 * Created by swapnil on 12/02/18.
 */
'use strict';

import * as mysqlDetails from '../../database/connectMySQL';
import * as utils from '../../services/utils.service';

let getAdminSocialDetails = (req, res, next) => {
    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            next({
                message: err
            });
        } else {
            connection.query('SELECT * FROM ??', ['admin_setting_social'],
                (err, rows) => {
                    if (err) {
                        next({
                            message: err
                        });
                    } else {
                        res.json({
                            message: 'Successfully fetched social details',
                            data: rows[0]
                        });
                    }
                });
        }
        connection.release();
    });
};

let updateAdminSocialDetails = (req, res, next) => {
    // Check for mandatory fields
    let mandatoryFields = ['socialFacebook', 'socialTwitter',
        'socialID'];
    let checkReqBody = utils.checkMandatoryRequestBody(req.body, mandatoryFields);
    if (checkReqBody.message !== 'success') {
        return next({message: checkReqBody.message});
    }

    mysqlDetails.pool.getConnection(function (err, connection) {
        if (err) {
            res.json(err);
        } else {
            let query = 'UPDATE ?? SET socialFacebook=?, socialTwitter=? WHERE ??=?';
            let values = ['admin_setting_social', req.body.socialFacebook,
                req.body.socialTwitter, 'socialID', req.body.socialID];
            query = mysqlDetails.mysqlFormat(query, values);
            connection.query(query, values, function (err, rows) {
                if (err) {
                    next({
                        message: err
                    });
                } else {
                    connection.query('SELECT * FROM ??', ['admin_setting_social'],
                        (err, rows) => {
                            if (err) {
                                next({
                                    message: err
                                });
                            } else {
                                res.json({
                                    message: 'Successfully updated social details',
                                    data: rows[0]
                                });
                            }
                        });
                }
            });
        }
        connection.release();
    });
};

module.exports = {
    getAdminSocialDetails: getAdminSocialDetails,
    updateAdminSocialDetails: updateAdminSocialDetails
};
