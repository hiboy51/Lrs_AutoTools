/*
 * @Author: Kinnon.Z 
 * @Date: 2018-08-11 17:08:40 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-08-11 17:24:55
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";
import { exec } from "child_process";

module.exports = function(destPath, sheetName) {
    return through.obj(function(file, encode, callback) {
        let p = file.path;
        let o =  path.join(destPath, sheetName);
        let c = `textureMerger -p ${p} -o ${o} -e /.*.(jpg|png)`;
        exec(c, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            callback();
         });
    });
};