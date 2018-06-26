/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-22 10:38:20 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-26 10:51:32
 */
import gulp from "gulp";
import CONST from "../const";
import minimist from "minimist";
import Utils from "../utils/utils";
import PluginError from "plugin-error";
import path from "path";
import fs from "fs";
import { AssertionError } from "assert";
import merge from "merge-stream";
import through from "through2";
import queue from "streamqueue";
import stringify from "../plugins/stringify";

const P = require("gulp-load-plugins")();
const args = minimist(process.argv.slice(2));

const res_json_path = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "lrsRoom.res.json");

function modifyThmJson () {
    return through.obj(function (file, encode, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        let filename = path.basename(file.relative);
        let ext = path.extname(filename);
        if (ext != ".exml" || filename.indexOf("dayNightAnim_") != 0) {
            console.log(filename);
            this.push(file);
            return callback();
        }

        let thmPath = "vipRoom.thm.json";
        if (filename.indexOf("_x.exml") != -1) {     
            thmPath = "vipRoomX.thm.json";
        }
        thmPath = path.join(CONST.Lrs_Root, CONST.Lrs_Room, thmPath);
        let content = fs.readFileSync(thmPath).toString("utf-8");
        let json = JSON.parse(content);
        if (json.exmls) {
            json.exmls.push(path.join("resource/lrsRoom/skins", filename));
        }
        fs.writeFileSync(thmPath, JSON.stringify(json, null, "    "));

        this.push(file);
        return callback();
    });
}

function modifyResJson() {
    return through.obj(function(file, encode, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        let filename = path.basename(file.relative);
        let ext = path.extname(filename);
        
        let resJson = JSON.parse(fs.readFileSync(res_json_path).toString("utf-8"));
        if (ext == ".json") {
            let thizJson = JSON.parse(file.contents.toString("utf-8"));
            let subkeys = Object.keys(thizJson.frames).sort().join(",");
            resJson.resources.push({
                "url": path.join("lrsRoom/assets/UI", `skin_${args.name}`, filename),
                "type": "sheet",
                "name": filename.replace(".", "_"),
                "subkeys": subkeys
            });
            fs.writeFileSync(res_json_path, JSON.stringify(resJson, null, "    "));
            this.push(file);
            return cb();
        }

        if (isSheetPng(file)) {     // 略过图集png
            this.push(file);
            return cb();
        }

        resJson.resources.push({
            "url": path.join("lrsRoom/assets/UI", `skin_${args.name}`, filename),
            "type": "image",
            "name": filename.replace(".", "_")
        });
        fs.writeFileSync(res_json_path, JSON.stringify(resJson, null, "    "));
        this.push(file);
        return cb();
    });
}

function isSheetPng(file) {
    let filename = path.basename(file.relative);
    if (path.extname(filename) != ".png") {
        return false;
    }
    let base = file.base;
    let fn = filename.slice(0, filename.indexOf("."));
    let fakeSheet = path.join(base, `${fn}.json`);
    return fs.existsSync(fakeSheet);
}

/**
 *  新增运营皮肤
 *  --dir 源目录
 *  --name 作为文件夹名后缀，将新建
 */
gulp.task("skin:add", () => {
    let dir = args.dir;
    let name = args.name;
    if (!dir || typeof (dir) != "string") {
        throw new PluginError("skin:added", "YOU MUST SPECIFY A DIRECTORY THAT CONTAINS ALL ASSETS SKIN NEEDED");
    }
    if (!name || typeof(name) != "string") {
        throw new PluginError("skin:added", "YOU MUST SPECIFY A NAME AS NEW FOLDER PLACE SKIN ASSETS");
    }
    return queue( 
        {objectMode: true},
        gulp.src(path.join(dir, "**/*.exml"))
            .pipe(modifyThmJson())
            .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "skins"))),

        gulp.src([path.join(dir, "**/*"), `!${path.join(dir, "**/*.exml")}`])
            .pipe(modifyResJson())
            .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/UI", `skin_${name}`)))
    );
});