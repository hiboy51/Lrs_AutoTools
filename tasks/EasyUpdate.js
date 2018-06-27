/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-21 18:33:31 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-27 11:33:27
 */
import gulp from "gulp";
import CONST from "../const";
import minimist from "minimist";
import Utils from "../utils/utils";
import PluginError from "plugin-error";
import path from "path";
import fs from "fs";
import { AssertionError } from "assert";

const P = require("gulp-load-plugins")();
const args = minimist(process.argv.slice(2));

/**
 *  同步覆盖 game_base 的 giftConfig.json
 *  必须指定源giftConfig.json路径或包含其目录路径
 */
gulp.task("gift:up_conf", () => {
    let file = args.file;
    if (!file) {
        throw new PluginError("gift:up_conf", "YOU MUST SPECIFY A FILE OR DIRECTORY");
    }
    
    let stat = fs.statSync(file);
    if (stat.isFile()) {
        if (path.basename(file) != "giftConfig.json") {
            throw new PluginError("gift:up_conf", "YOU MUST SPECIFY A \"giftConfig.json\" FILE");
        }
    }
    if (stat.isDirectory()) {
        file = path.join(file, "**/giftConfig.json");
    }
    return gulp.src(file)
            .pipe(P.debug())
            .pipe(gulp.dest(path.join(CONST.GameBase_Root, CONST.CommonPath, "config")));
});

/**
 *  同步覆盖 game_base 的 .exml 文件
 *  必须指定源 .exml 路径或包含其目录路径
 */
gulp.task("gift:up_skin", () => {
    let file = args.file;
    let toLrs = !!args.l;
    if (!file) {
        throw new PluginError("gift:up_skin", "YOU MUST SPECIFY A FILE OR DIRECTORY");
    }
    let stat = fs.statSync(file);
    if (stat.isFile()) {
        if (path.extname(file) != ".exml") {
            throw new PluginError("gift:up_skin", "YOU MUST SPECIFY A EXML FILE");
        }
    }
    if (stat.isDirectory()) {
        file = path.join(file, "**/*.exml");
    }
    
    let root = toLrs ? CONST.Lrs_Root : CONST.GameBase_Root;
    return gulp.src(file)
                .pipe(P.debug())
                .pipe(gulp.dest(path.join(root, CONST.CommonPath, "skins")));
});

gulp.task("sounds:cpy_src", () => {
    let del = !!args.del || true;
    let files = args.file;
    if (!files) {
        throw new PluginError("sound:replace", "YOU MUST SPECFIY ONE OR MORE .mp3 FILES");
    }
    files = files.split(",");
    let toBase = path.join(CONST.GameBase_Root, CONST.SoundsPath);
    let toSounds = path.join(CONST.Sounds_Root, "allSounds");
    let toLrs = path.join(CONST.Lrs_Root, CONST.SoundsPath);
    return gulp.src(files)
            .pipe(P.debug())
            .pipe(P.if(del, P.clean({force: true})))
            .pipe(gulp.dest(toBase))
            .pipe(gulp.dest(toSounds))
            .pipe(gulp.dest(toLrs));
});

