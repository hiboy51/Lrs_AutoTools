/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 17:18:34 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-21 14:55:43
 */
import through from "through2";
import Utils from "../utils/utils";

module.exports = function (giftIds) {
    giftIds = Utils.uniqueArray(giftIds);
    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        giftIds.every(giftId => {
            let prefix_asset = [`gift_${giftId}_`, `gift_${giftId}.`];
            let prefix_skin = [`ani_gift_${giftId}_`, `ani_gift_${giftId}.`];
            
            let fullPath = file.path;
            let base = file.base;
            let relative = file.relative;
            prefix_asset.forEach(e => {
                if (relative.indexOf(e) == 0) {
                    this.push(file);
                    // console.log(`fullpath: ${fullPath}, file: ${relative}, prefix: ${e}`);
                    return false;
                }
            });
            prefix_skin.forEach(e => {
                if (relative.indexOf(e) == 0) {
                    this.push(file);
                    // console.log(`fullpath: ${fullPath}, file: ${relative}, prefix: ${e}`);
                    return false;
                }
            });
            return true;
        });

        return callback();
    });
};