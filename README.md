# Lrs_Gift_AutoTools
每天开一堆文件夹复制来复制去，脑壳都搞晕！

# 先安装 node.js 和 gulp 环境

# 术语说明
  所有关联：common目录 + giftEffectPlayer.js

# 几个重要任务
  1) gulp \\ default任务，根据GameBase里新增的资源，补充相应common.res.json，并将所有关联同步给Lrs, 必须指定 --gid
  
  2) gulp gift:gen_res --gid aaa|aaa,bbb \\ 根据GameBase里新增的资源，补充相应common.res.json, 必须指定 --gid
  
  3) gulp sounds:added (--delete) \\ 根据Lrs里新增的音效资源,同步GameBase并补充其common.res.json，可选参数 --delete 同步删除common.res.json中没有的资源项
  
  4) gulp sounds \\ 同步GameBase中所有音效文件到 Lrs 和 allSounds
  
  5) gulp gift:b2l \\ 同步GameBase资源及代码 => Lrs， 不包括音效
  
  6) gulp gift:l2b \\ 同步Lrs资源及代码 => GameBase, 不包括音效
  
  7) gulp gift:player_b2l \\ 同步GameBase代码 => Lrs
  
  8) gulp gift:player_l2b \\ 同步Lrs代码 => GameBase
  
  9) gulp gift:common_b2l \\ 同步GameBase资源 => Lrs, 不包括音效
  
  10) gulp gift:common_l2b \\ 同步Lrs资源 => GameBase, 不包括音效
  
 # 快捷文件替换
  1) gulp gift:cpy_src --dir aaa|aaa,bbb  \\ 拷贝原图，必须指定（--dir）源路径，可以多个以逗号隔开
  
  2) gulp gift:up_conf --file \\ 替换GameBase的giftConfig.json，必须指定（--file）源路径或包含源文件目录
  
  3) gulp gift:up_skin --file \\ 替换GameBase的动画文件(.exml)，必须指定（--file）源路径或包含源文件目录
