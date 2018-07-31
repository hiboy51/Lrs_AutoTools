/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-02 19:58:10 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-31 10:43:23
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
import series from "stream-series";
import stringify from "../plugins/stringify";
import modify_res from "../plugins/modify_res_json";

const P = require("gulp-load-plugins")();
const args = minimist(process.argv.slice(2));

const toBag = path.join(CONST.Host_Game_Root, "resource/hghall/assert/bag");
const toChat = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/chatbox");
const toEffect = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/joinroomeffect");

const prefix_bag = ["liaotian_icon_", "ruchang_icon_", "touxiang_icon_"];
const prefix_chat = ["ChatBox_"];
const prefix_effect = ["enter_"];


function filterBagItem(file, groups, resource) {
    let fn = path.basename(file.relative);
    let key = fn.replace(".", "_");

    let group = groups.filter(e => e.name == "modulereload_hghall")[0];
    let karr = group.keys.split(",");

    if (!karr.include(key)) {                       // 避免重复添加
        karr.push(key);
        group.keys = karr.sort().join(",");
    }

    if (resource.every(e => e.name != key)) {       // 避免重复添加
        resource.push({
            "url": path.join("hghall/assert/bag", fn),
            "type": "image",
            "name": key
        });
    }
}

function filterChatItem(file, groups, resource) {
    let fn = path.basename(file.relative);
    let key = fn.replace(".", "_");

    if (prefix_chat.some(e => fn.includes(e)) && resource.every(e => e.name != key)) {
        resource.push({
            "url": path.join("lrsRoom/assets/chatbox", fn),
            "type": "image",
            "name": key
        });
        return;
    }
    
    if (prefix_effect.some(e => fn.includes(e)) && resource.every(e => e.name != key)) {
        resource.push({
            "url": path.join("lrsRoom/assets/joinroomeffect", fn),
            "type": "image",
            "name": key
        });
    }
}

/**
 * 玩家装饰：头像框，气泡框，入场特效，弹幕框
 */
gulp.task("decoration:added", () => {
    let dirs = args.dir;
    if (!dirs) {
        throw new PluginError("decoration:added", "YOU MUST SPECIFY ONE OR MORE DIRECTORIES");
    }
    dirs = path.join(dirs, "**/*");
    const hallResJsonPath = path.join(CONST.Host_Game_Root, "resource/hghall", "hghall.res.json");
    const roomResJsonPath = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "lrsRoom.res.json");
    
    let filter = (arr) => {
        return P.filterEach((_, filepath) => {
            let fn = path.basename(filepath);
            let contain = arr.some(e => fn.includes(e));
            return contain; 
        });
    };

    return series(
        gulp.src(dirs)
            .pipe(filter(prefix_bag))
            .pipe(modify_res(hallResJsonPath, filterBagItem))
            .pipe(P.rename(path => {
                path.dirname = "";
            }))
            .pipe(gulp.dest(toBag)),

        gulp.src(dirs)
            .pipe(filter(prefix_chat.concat(prefix_effect)))
            .pipe(modify_res(roomResJsonPath, filterChatItem))
            .pipe(filter(prefix_chat))
            .pipe(P.rename(path => {
                path.dirname = "";
            }))
            .pipe(gulp.dest(toChat)),
        
        gulp.src(dirs)
            .pipe(filter(prefix_effect))
            .pipe(P.rename(path => {
                path.dirname = "";
            }))
            .pipe(gulp.dest(toEffect))
    )
    .pipe(P.debug())
    .pipe(P.errorHandle());
});