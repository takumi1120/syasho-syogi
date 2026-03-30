"# Gobblet-gobblers" 

# ルール
・3*3のマスがある
・プレイヤーは二人、大、中、小の駒を二つずつ持つ
・それらを駆使しマスに３連で駒を並べたら勝利となる。
・駒はマス内を移動できる、サイズに応じて被せることも可能である。（例：大は既に小が置いてあるマスに置くことができる）

追加機能

ユーザー登録
キャラクター登録
キャラクター選択
戦績表示機能

#画面一覧
・スタート画面（character選択を内包する、ユーザー登録画面に遷移するボタン、対戦開始し対戦画面に遷移する、ユーザー
戦績画面のへの遷移
・ユーザー登録画面
・対戦画面
・戦績表示画面
・決着時の画面

#DB設計
・user
id:number
name:string


・character
id:number
name:string
image:base64

・result
id:number
win:number
lose:number
userid:number

#API設計
・ユーザー　CRUD
・result　CRUD


-- public."characters" definition -- Drop table -- DROP TABLE public."characters"; CREATE TABLE public."characters" ( id serial4 NOT NULL, "name" text NOT NULL, image text NULL, CONSTRAINT characters_pkey PRIMARY KEY (id) ); -- public.results definition -- Drop table -- DROP TABLE public.results; CREATE TABLE public.results ( id serial4 NOT NULL, win int4 NOT NULL, lose int4 NOT NULL, user_id int4 NULL, CONSTRAINT results_pkey PRIMARY KEY (id) ); -- public.results foreign keys ALTER TABLE public.results ADD CONSTRAINT results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id); -- public.users definition -- Drop table -- DROP TABLE public.users; CREATE TABLE public.users ( id serial4 NOT NULL, "name" text NOT NULL, CONSTRAINT users_pkey PRIMARY KEY (id) );