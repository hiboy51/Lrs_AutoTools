/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-26 10:47:24 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-26 11:00:13
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";


module.exports = function (resJsonPath) {
    return through.obj(function(file, encode, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        let fileName = path.basename(file.relative);
        let extName = path.extname(fileName);

        if ([".jpg", ".png"].indexOf(extname) == -1) {      // 删选图标文件
            this.push(file);
            return callback();
        }

        let content = fs.readFileSync(resJsonPath).toString("utf-8");
        let json = JSON.parse(content);
        
        let filekey = filename.replace(".", "_");
        let resources = json.resources;
        if (!resources.some(e => e.name == filekey)) {
            resources.push({
                "url": path.join("common/assets/giftIcon", filename),
                "type": "sheet",
                "name": filekey,
                "subkeys": subkeys 
            });
        }
        fs.writeFileSync(resJsonPath, JSON.stringify(json));
        return callback();
    });
};