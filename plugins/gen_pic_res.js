/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 19:23:36 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-21 16:16:55
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";

const CARES = {".png": 1, ".jpg": 1, ".json": 1};
const ROOT = "common/assets/giftNew";

const GameBase_Root = "/Users/momo/game_base";
const CommonPath = "resource/common";

function appendGroup(group, fileKey) {
    if (group.keys == "") {
        group.keys = fileKey;
    }
    else {
        group.keys += `,${fileKey}`;
    }
}

function getSheetJsonSubkeys(sheet) {
    let content = fs.readFileSync(path.join(GameBase_Root, CommonPath, "assets/giftNew", sheet)).toString("utf-8");
    let json = JSON.parse(content);
    let keys = [];
    for (let key in json.frames) {
        keys.push(key);
    }
    return keys.join(",");
}

function handleSheet(json, filename) {
    let fileKey = filename.replace(".", "_");
    let resources = json.resources;
    let gid = Utils.getGiftId(filename, "res");
    let group = Utils.getGroup(json, gid);
    appendGroup(group, fileKey);

    resources.push({
        "url": path.join(ROOT, filename),
        "type": "sheet",
        "name": fileKey,
        "subkeys": getSheetJsonSubkeys(filename)
    });
}

function handlePicture(json, filename) {
    let fileKey = filename.replace(".", "_");
    let resources = json.resources;
    let gid = Utils.getGiftId(filename, "res");
    let fakeName = `gift_${gid}${path.extname(filename)}`;
    if (fakeName == filename) {     // 排除图集的png
        return;
    }

    let group = Utils.getGroup(json, gid);
    appendGroup(group, fileKey);

    resources.push({
        "url": path.join(ROOT, filename),
        "type": "image",
        "name": fileKey
    });
}

module.exports = function (resJsonPath) {
    return through.obj(function (file, encode, callback) {
        if (file.isNull()) {
            this.push(file);
            callback();
        }

        let fn = file.relative;
        let ext = path.extname(fn);
        if (ext in CARES) {
            let content = fs.readFileSync(resJsonPath).toString("utf-8");
            let json = JSON.parse(content);
            if (ext == ".json") {
                handleSheet(json, fn);
            }
            else {
                handlePicture(json, fn);
            }
            fs.writeFileSync(resJsonPath, JSON.stringify(json));
        }
        else {
            this.push(file);
        }
        callback();
    });  
};