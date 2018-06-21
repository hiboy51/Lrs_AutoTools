/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 18:47:50 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-21 14:55:31
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";

function genResJson(resJsonPath, filename) {
    let gid = Utils.getGiftId(filename, "skin");
    let filekey = filename.replace(".", "_");
    let resJson = fs.readFileSync(resJsonPath).toString("utf-8");
    let json = JSON.parse(resJson);

    let group = Utils.getGroup(json, gid);
    if (group.keys == "") {
        group.keys += `${filekey}`;
    }
    else {
        group.keys += `,${filekey}`;
    }

    let resources = json.resources;
    resources.push({
        "url": path.join("common/skins", filename),
        "type": "text",
        "name": filekey
    });

    return json;
}

module.exports = function (resJson) {
    return through.obj(function(file, encoding, callback) {
        let fileName = file.relative;
        let ext = path.extname(fileName);
        if (ext == ".exml") {
            let genJson = genResJson(resJson, fileName);
            fs.writeFileSync(resJson, JSON.stringify(genJson));
        }
        else {
            this.push(file);
        }
        callback();
    });
};