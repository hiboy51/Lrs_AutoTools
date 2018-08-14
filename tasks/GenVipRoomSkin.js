/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-22 10:38:20 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-08-14 10:31:09
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
import series from "stream-series";
import sheet from "../plugins/MergeTexture";
import editResJson from "../plugins/modify_res_json";
import je from "gulp-json-editor";
import compress from "../plugins/tinify_png_jpg";

const P = require("gulp-load-plugins")();
const args = minimist(process.argv.slice(2));

const lrsResJson = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "lrsRoom.res.json");

/**
 * 判断一张图片是否是合图(通过判断是否有同名.json文件的存在)
 * @param {file} file 图片地址
 */
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
 * 
 *  处理流程有如下几个步骤：
 *     1.处理图片资源。除开 icon 与 preview 之外的png图将被打入合集
 *     2.拷贝.exml到相应目录，并注入lrsRoom.res.json
 *     3.拷贝图片资源（icon, preview, 合图及其他jpg散图）,并注入lrsRoom.res.json
 *     4.注入皮肤配置文件vipSkin.json（修改icon, preview, anim, res字段）
 */
gulp.task("_skin:move_src", () => {
    let dir = args.dir;
    let name = args.name;
    const dest = path.join(dir, "dest");
    const icon$pre = [`vs_${name}.png`, `vs_${name}_pre.png`];
    // 非图集资源
    let notSheetAsset = icon$pre.map(e => path.join(dir, "**", e))                        // icon 和 preview
                                .concat([path.join(dir, "**/*.exml")])                    // exml文件
                                .concat([path.join(dir, "**/*.jpg")]);                    // jpg文件

    // 需打入图集的资源
    let sheetAsset = [path.join(dir, "**/*.*")].concat(notSheetAsset.map(e => `!${e}`));
    console.log(sheetAsset);
    
    return merge(
        // 拷贝非图集资源
        gulp.src(notSheetAsset)
        .pipe(P.rename(path => path.dirname = ""))
        .pipe(gulp.dest(dest)),
    
        // 拷贝图集资源到临时文件夹
        gulp.src(sheetAsset)
            .pipe(P.rename(path => path.dirname = ""))
            .pipe(gulp.dest(path.join(dest, "sheet")))
    )
    .pipe(P.errorHandle());
});

gulp.task("_skin:sheet", () => {
    const dir = args.dir;
    const name = args.name;
    const dest = path.join(dir, "dest");
    // 打包图集
    return gulp.src(path.join(dest, "sheet"), {allowEmpty: true})
                .pipe(sheet(dest, `animSkin_${name}.json`))
                .pipe(P.clean({force: true}))
                .pipe(P.errorHandle());
});

gulp.task("_skin:process_src", () => {
    const dir = args.dir;
    const name = args.name;
    const dest = path.join(dir, "dest");
    const icon$pre = [`vs_${name}.png`, `vs_${name}_pre.png`];
    const newFolder = path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/UI", `skin_${name}`);

    return merge(
        // 拷贝exml文件并注入lrsRoom.res.json
        gulp.src(path.join(dest, "**/*.exml"))
            .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/viproomskins")))
            .pipe(editResJson(lrsResJson, (file, groups, resources) => {
                let fn = path.basename(file.path);
                let fk = fn.replace(".exml", "_exml");
                if (resources.some(e => e.name == fk)) {
                    return;
                }
                resources.push({
                    "url": path.join("lrsRoom/assets/viproomskins", fn),
                    "type": "text",
                    "name": fk
                });
            })),
        
        // 拷贝图片并注入lrsRoom.res.json
        gulp.src(path.join(dest, "*"))
            .pipe(P.filterEach((_, fp) => {
                let fn = path.basename(fp);
                return icon$pre.includes(fn);
            }))
            .pipe(compress())
            .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "assets/UI/skin_vip")))
            .pipe(editResJson(lrsResJson, (file, groups, resources) => {
                let fn = path.basename(file.path);
                let fk = fn.replace(".png", "_png");
                if (resources.some(e => e.name == fk)) {
                    return;
                }
                resources.push({
                    "url": path.join("lrsRoom/assets/UI/skin_vip", fn),
                    "type": "image",
                    "name": fk
                });
            })),
        gulp.src(path.join(dest, "*.jpg"))
            .pipe(P.filterEach((_, fp) => {
                jpgs.push(path.basename(fp));
                return true;
            }))
            .pipe(compress())
            .pipe(gulp.dest(newFolder))
            .pipe(editResJson(lrsResJson, (file, groups, resources) => {
                let fn = path.basename(file.path);
                let fk = fn.replace(".jpg", "_jpg");
                if (resources.some(e => e.name == fk)) {
                    return;
                }
                resources.push({
                    "url": path.join("lrsRoom/assets/UI", `skin_${name}`, fn),
                    "type": "image",
                    "name": fk
                });
            })),
        gulp.src(path.join(dest, "**", `animSkin_${name}.*`))
            .pipe(compress())
            .pipe(gulp.dest(newFolder))
            .pipe(editResJson(lrsResJson, (file, groups, resources) => {
                if (path.extname(file.relative) != ".json") {
                    return;
                }
                let fn = path.basename(file.path);
                let fk = `animSkin_${name}_json`;
                if (resources.some(e => e.name == fk)) {
                    return;
                }
                let fc = file.contents.toString("utf-8");
                let sheetjson = JSON.parse(fc);
                let subkeys = Object.keys(sheetjson.frames).sort().join(",");
                resources.push({
                    "url": path.join("lrsRoom/assets/UI", `skin_${name}`, fn),
                    "type": "sheet",
                    "name": fk,
                    "subkeys": subkeys 
                });
            }))  
    )
    .pipe(P.errorHandle());
});

let jpgs = [];
gulp.task("_skin:gen_config", () => {
    const dir = args.dir;
    const name = args.name;
    const id = args.id;
    // 注入皮肤配置文件vipSkin.json
    return gulp.src(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "config/vipSkin.json"))
                .pipe(je(json => {
                    for (let item of json) {
                        if (item.id == id) {
                            item.icon = `vs_${name}_png`;
                            item.preview = `vs_${name}_pre_png`;
                            item.anim = `dayNightAnim_${name}`;
                            item.res = [`animSkin_${name}_json`].concat(jpgs.map(e => e.replace(".jpg", "_jpg"))).join(",");
                            break;
                        }
                    }
                    return json;
                }))
                .pipe(stringify())
                .pipe(P.beautify({
                    keep_array_indentation: true,
                    brace_style: "expand",
                    indent_size: 4,
                    indent_char: " "
                }))
                .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.Lrs_Room, "config")))
                .pipe(P.errorHandle());
});

gulp.task("_skin:del_tmp_folder", () => {
    const dir = args.dir;
    const dest = path.join(dir, "dest");
    // 删除中途生成的文件夹
    return gulp.src(dest, {allowEmpty: true})
    .pipe(P.clean({force: true}))
    .pipe(P.errorHandle());
});

gulp.task("skin:add", gulp.series(cb => {
    let dir = args.dir;
    let name = args.name;
    let id = args.id;
    if (!dir || typeof (dir) != "string") {
        throw new PluginError("skin:added", "YOU MUST SPECIFY A DIRECTORY THAT CONTAINS ALL ASSETS SKIN NEEDED");
    }
    if (!name || typeof(name) != "string") {
        throw new PluginError("skin:added", "YOU MUST SPECIFY A NAME AS NEW FOLDER PLACE SKIN ASSETS");
    }
    if (!id) {
        throw new PluginError("skin:added", "YOU MUST SPECIFY A ID WHICH CONFIG THE ADDED SKIN");
    }
    cb();
}, "_skin:move_src", "_skin:sheet", "_skin:process_src", "_skin:gen_config", "_skin:del_tmp_folder"));