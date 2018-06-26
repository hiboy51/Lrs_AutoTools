# Lrs_Gift_AutoTools
  每天开一堆文件夹复制来复制去，脑壳都搞晕！

## [先安装 node.js 和 gulp 环境](https://gulpjs.com/)

## 术语说明
  *所有关联*：common目录 + player代码

## 几个重要任务
  *  gulp                    
  // default任务，根据GameBase里新增的资源，补充相应common.res.json，并将**`所有关联`**同步给Lrs, 必须指定 --gid
  
  *  gulp gift:gen_res --gid aaa|aaa,bbb    
  // 根据GameBase里新增的资源，补充相应common.res.json, 必须指定 --gid
  
  *  gulp sounds:added (--delete)           
  // 根据Lrs里新增的音效资源,同步GameBase并补充其common.res.json，可选参数 --delete 同步删除common.res.json中没有的资源项
  
  *  gulp sounds                
  // 同步GameBase中所有音效文件到 Lrs 和 allSounds
  
  *  gulp gift:b2l              
  // 同步GameBase资源及代码 => Lrs， 不包括音效
  
  *  gulp gift:l2b              
  // 同步Lrs资源及代码 => GameBase, 不包括音效
  
  *  gulp gift:player_b2l       
  // 同步GameBase代码 => Lrs
  
  *  gulp gift:player_l2b       
  // 同步Lrs代码 => GameBase
  
  *  gulp gift:common_b2l       
  // 同步GameBase资源 => Lrs, 不包括音效
  
  *  gulp gift:common_l2b      
  // 同步Lrs资源 => GameBase, 不包括音效
  
 ## 快捷文件替换
  *  gulp gift:cpy_src --dir aaa|aaa,bbb      
  // 拷贝原图，必须指定（--dir）源路径，可以多个以逗号隔开
  
  * gulp gift:up_conf --file                 
  // 替换GameBase的giftConfig.json，必须指定（--file）源路径或包含源文件目录
  
  * gulp gift:up_skin --file --l                 
  // 替换GameBase的动画文件(.exml)，必须指定（--file）源路径或包含源文件目录,`可选参数(--l)，拷贝到lrs目录下，否则base目录`

## 处理皮肤
  * gulp skin:add --dir --name
