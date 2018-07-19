/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-19 19:21:01 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-19 20:33:19
 */
import through from "through2";
import Utils from "../utils/utils";
import path from "path";
import fs from "fs";
import tinify from "tinify";

tinify.key = "sb8Dd2imQCMtJnDaZ5MRAnQwC5KrToHP";

module.exports = function () {
    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        let fn = path.basename(file.relative);
        let ext = path.extname(fn);
        if ([".png", ".jpg"].some(e => e == ext) && file.isBuffer()) {
            console.log(`start compress ${fn}`);
            tinify.fromBuffer(file.contents).toBuffer((err, resultData) => {
                if (err) throw err;
                
                file.contents = resultData;
                this.push(file);
                callback();
            });
        }
        else {
            return callback();
        }
    });
};