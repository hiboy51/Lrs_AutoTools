/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 19:23:36 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-27 16:32:08
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

function handlePicture(json, filename, base) {
    let fileKey = filename.replace(".", "_");
    let resources = json.resources;
    let gid = Utils.getGiftId(filename, "res");

    // 排除图集的png
    // 如果有同名.json文件，则判定为图集
    let ext = path.extname(filename);
    let fakeName = `${filename.replace(ext, "")}.json`;
    let stat = fs.statSync(path.join(base, fakeName));
    if (stat && stat.isFile()) {
        console.log(`skip sheet: ${filename} exists ${fakeName}`);
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
        let base = file.base;
        let ext = path.extname(fn);
        if (ext in CARES) {
            let content = fs.readFileSync(resJsonPath).toString("utf-8");
            let json = JSON.parse(content);
            if (ext == ".json") {
                handleSheet(json, fn);
            }
            else {
                handlePicture(json, fn, base);
            }
            fs.writeFileSync(resJsonPath, JSON.stringify(json));
        }
        else {
            this.push(file);
        }
        callback();
    });  
};