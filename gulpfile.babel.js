/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-14 14:15:03 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-27 11:32:21
 */
import gulp from "gulp";
import path from "path";
import sequence from "gulp-sequence";
import merge_stream from "merge-stream";
import del from "promised-del";
import minimist from "minimist";
import je from "gulp-json-editor";
import stringify from "./plugins/stringify";
import requireDir from "require-dir";
import Utils from "./utils/utils";
import CONST from "./const";

const tasks = requireDir("./tasks");
const $ = require("gulp-load-plugins")();

const GameBase_Root = CONST.GameBase_Root;
const Lrs_Root = CONST.Lrs_Root;
const Host_Game_Root = CONST.Host_Game_Root;
const Sounds_Root = CONST.Sounds_Root;
const CommonPath = CONST.CommonPath;
const SoundsPath = CONST.SoundsPath;
const GiftPlayerPath = CONST.GiftPlayerPath;

function synSounds() {
    let from = path.join(GameBase_Root, SoundsPath, "**/*");
    let to = path.join(Sounds_Root, "allSounds");
    let to2 = path.join(Lrs_Root, SoundsPath);
    return gulp.src(from)
            .pipe(gulp.dest(to))
            .pipe(gulp.dest(to2));
}

gulp.task('common_res_b2l', function() {
    return gulp.src(path.join(GameBase_Root, CommonPath, "common.res.json"))
      .pipe(gulp.dest(path.join(Lrs_Root, CommonPath)));
});

gulp.task("clean_sounds", done => {
    return del([
        path.join(Sounds_Root, "allSounds", "**/*"),
        path.join(Lrs_Root, SoundsPath, "**/*")
    ], {force: true});
});

gulp.task("clean_gift_l", function () {
    let p = path.join(Lrs_Root, CommonPath, "**/*");
    console.log(p);
    return del([
        p
    ], {force:true});
});

gulp.task("clean_gift_b", function(done) {
    return del([
        path.join(GameBase_Root, CommonPath, "**/*")
    ], {force:true});
});

gulp.task("gift:player_l2b", done => {
    return gulp.src(path.join(Lrs_Root, GiftPlayerPath))
                .pipe(gulp.dest(path.dirname(path.join(GameBase_Root, GiftPlayerPath))));
});

gulp.task('gift:common_b2l', () => {
    let from = path.join(GameBase_Root, CommonPath, "**/*");
    let to = path.join(Lrs_Root, CommonPath);
    return gulp.src(from)
                .pipe(gulp.dest(to));
});

gulp.task('gift:common_l2b', () => {
    let from = path.join(Lrs_Root, CommonPath, "**/*");
    let to = path.join(GameBase_Root, CommonPath);
    return gulp.src(from)
                .pipe(gulp.dest(to));
});

gulp.task("gift:player_b2l", done => {
    return gulp.src(path.join(GameBase_Root, GiftPlayerPath))
                .pipe(gulp.dest(path.dirname(path.join(Lrs_Root, GiftPlayerPath))));
});

const Arguments = {
    string: "delete",
    default: {delete: false}
};
let args = minimist(process.argv.slice(2), Arguments);
gulp.task("sounds:gen_res", done => {
    const from = path.join(Lrs_Root, SoundsPath);
    const to = path.join(GameBase_Root, SoundsPath);
    let diffs = Utils.compare_dir(from, to, [".DS_Store"]);
    let supportDel = !!args.delete;
    return gulp.src(path.join(GameBase_Root, CommonPath, "common.res.json"))
            .pipe(je(json => {
                let groups = json.groups;
                let groupName;
                let keys;
                groups.every(item => {
                    groupName = item.name;
                    if (groupName == "sounds") {
                        keys = item.keys.split(",");
                        keys = keys.concat(diffs.add.map(a => a.replace(".", "_")));
                        keys = keys.join(",");

                        if (supportDel) {
                            diffs.delete.forEach(de => {
                                let key = `,${de.replace(".", "_")}`;
                                console.log(key);
                                keys = keys.replace(key, "");
                            });
                        }
                        item.keys = keys;
                        return false;
                    }
                    return true;
                });

                let resources = json.resources;         // 处理resources字段
                diffs.add.forEach(a => {
                    let obj = {};
                    obj.url = path.join("common/allSounds", a);
                    obj.type = "sound";
                    obj.name = a.replace(".", "_");
                    resources.push(obj);
                });
                if (supportDel) {
                    diffs.delete.forEach(del => {
                        let key = del.replace(".", "_");
                        resources.every((item, index, arr) => {
                            if (item.name == key) {
                                arr.splice(index, 1);
                                return false;
                            }
                            return true;
                        });
                    });
                }
                return json;
            }))
            .pipe(gulp.dest(path.join(GameBase_Root, CommonPath)));
});


/** 拷贝礼物资源及代码 gamebase => lrs */
gulp.task("gift:b2l", gulp.series("clean_gift_l", "gift:common_b2l", "gift:player_b2l"));

/** 拷贝礼物资源及代码 lsr => gamebase */
gulp.task("gift:l2b", gulp.series("clean_gift_b", "gift:common_l2b", "gift:player_l2b"));

/** 同步声音库 game_base => allSounds && lrs */
gulp.task("sounds", gulp.series("clean_sounds", "common_res_b2l", synSounds));

/** 将lrs新增的音效同步到game_base */
gulp.task("sounds:added", gulp.series("sounds:gen_res", "beautify_res_json", () => {
    const to = path.join(GameBase_Root, SoundsPath);
    return  gulp.src(path.join(Lrs_Root, SoundsPath, "**/*"))
                .pipe($.changed(to, {hasChanged: $.changed.compareContents}))
                .pipe($.debug())
                .pipe(gulp.dest(to));
}));

/**
 * 自动注册礼物资源配置到common.res.json中
 * 包括动画资源和图标资源
 * 必须指定参数--gid，参见task <asset:gen_res_b>
 */
gulp.task("gift:gen_res", gulp.series("asset:gen_res_b", "icon:gen_res_b"));

/**
 * 添加或覆盖新的音效资源到base，生成对应的res.json并同步给lrs, allSounds,最后同步common到lrs
 * 必须指定一个或多个音效文件路径(--file)
 * 可选参数(--del)， 默认值true，表示拷贝后删除源文件
 */
gulp.task("sounds:modify", gulp.series("sounds:cpy_src", "sounds:added", "sounds", "gift:common_b2l"));

/** 来个全套 */
gulp.task("default", gulp.series("gift:gen_res", "gift:b2l"));