/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-21 15:25:38 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-21 16:07:21
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
        let filename = path.basename(file.relative);
        if (path.extname(filename) != ".json") {
            this.push(file);
            return callback();
        }
        let filekey = filename.replace(".", "_");
        let content = fs.readFileSync(resJsonPath).toString("utf-8");
        let json = JSON.parse(content);

        let groups = json.groups;
        for (let i in groups) {
            if (groups[i].name == "gift") {
                let keys = groups[i].keys.split(",");
                if (keys.every(e => e != filekey)) {
                    keys.push(filekey);
                    groups[i].keys = keys.join(",");
                }
                break;
            }
        }

        let fc = file.contents.toString("utf-8");
        let sheetjson = JSON.parse(fc);
        let subkeys = Object.keys(sheetjson.frames).sort().join(",");
        let resources = json.resources;
        let exist = false;
        for (let i in resources) {
            if (resources[i].name == filekey) {
                resources[i].subkeys = subkeys;
                exist = true;
                break;
            }
        }
        if (!exist) {
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