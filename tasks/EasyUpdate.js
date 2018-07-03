/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-21 18:33:31 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-03 14:20:28
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
 *  同步覆盖 game_base 和 lrs 的 giftConfig.json
 *  必须指定源giftConfig.json路径或包含其目录路径
 */
gulp.task("gift:up_conf", () => {
    let file = args.file;
    let del = args.del === false ? false : true;
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
            .pipe(P.if(del, P.clean({force: true})))
            .pipe(gulp.dest(path.join(CONST.GameBase_Root, CONST.CommonPath, "config")))
            .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.CommonPath, "config")));
});

/**
 *  同步覆盖 game_base 和 lrs 的 .exml 文件
 *  必须指定源 .exml 路径或包含其目录路径
 */
gulp.task("gift:up_skin", () => {
    let file = args.file;
    let del = !!args.del;
    if (!file) {
        throw new PluginError("gift:up_skin", "YOU MUST SPECIFY ONE OR MORE FILE OR DIRECTORY");
    }
    file = file.split(",")
            .map(f => {
                f = f.trim();
                let stat = fs.statSync(f);
                if (stat.isDirectory()) {
                    return path.join(f, "**/*.exml");
                }
                if (stat.isFile()) {
                    if (path.extname(f) != ".exml") {
                        throw new PluginError("gift:up_skin", "YOU MUST SPECIFY A EXML FILE");
                    }
                    return f;
                }
                return f;
            });

    return gulp.src(file)
                .pipe(P.debug())
                .pipe(P.if(del, P.clean({force: true})))
                .pipe(gulp.dest(path.join(CONST.GameBase_Root, CONST.CommonPath, "skins")))
                .pipe(gulp.dest(path.join(CONST.Lrs_Root, CONST.CommonPath, "skins")));
});

let cpy_src = (files, del, tol) => {
    let toBase = path.join(CONST.GameBase_Root, CONST.SoundsPath);
    let toSounds = path.join(CONST.Sounds_Root, "allSounds");
    let toLrs = path.join(CONST.Lrs_Root, CONST.SoundsPath);
    return gulp.src(files)
            .pipe(P.debug())
            .pipe(P.if(del, P.clean({force: true})))
            .pipe(P.if(!tol, gulp.dest(toBase)))
            .pipe(P.if(!tol, gulp.dest(toSounds)))
            .pipe(gulp.dest(toLrs));
};

gulp.task("sounds:cpy_src", () => {
    let del = args.del === false ? false : true;
    let files = args.file;
    if (!files) {
        throw new PluginError("sound:cpy_src", "YOU MUST SPECFIY ONE OR MORE .mp3 FILES");
    }
    files = files.split(",").map(f => f.trim());
    return cpy_src(files, del, false);
});

gulp.task("sounds:cpy_src_2l", () => {
    let del = args.del === false ? false : true;
    let files = args.file;
    if (!files) {
        throw new PluginError("sound:cpy_src_2l", "YOU MUST SPECFIY ONE OR MORE .mp3 FILES");
    }
    files = files.split(",").map(f => f.trim());
    return cpy_src(files, del, true);
});