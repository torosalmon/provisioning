# Vagrant

### 構成

> ```
> ・/root
> ├ /dist         ... RSync同期フォルダ
> ├ Vagrantfile   ... Vagrant 設定ファイル
> └ Vagrant_VM.sh ... VM CentOS上で実行するシェルスクリプト
> ```

### 概要

> CentOS仮想環境をインストールします。
>
> * Box     : `bento/CentOS-7.3`
> * Package : `Apache, PHP7, MySQL5.7`
>
> CentOS上でシェルスクリプト`Vagrant_VM.sh`を実行します。サーバー構成はこのファイルで設計します。

### ファイル同期

> 共有フォルダ機能を利用してローカルとサーバー間でファイルを同期します。RSyncを利用します。ローカルの`/dist`フォルダとサーバーの`/var/www/html`が同期フォルダになります。

### セットアップ

> 前提アプリケーションをインストールします。
>
> * [Vagrant](https://www.vagrantup.com/)
> * [Oracle VM VirtualBox](https://www.virtualbox.org/)
>
> 更にWindowsではRSyncのインストールが必要になります。導入には[Scoop](http://scoop.sh/)を利用します。MacはデフォルトでRSyncが使えます。
>
> #### Scoopインストール
>
> `iex (new-object net.webclient).downloadstring('https://get.scoop.sh')`
>
> #### ScoopからRSyncとopenSSHをインストール
>
> `$ scoop install rsync win32-openssh`

### コマンド

> `$ vagrant up`
>
> 仮想マシンの起動。初回は環境がないのでインストールが走ります。
>
> `$ vagrant halt`
>
> 仮想マシンの停止
>
> `$ vagrant rsync-auto`
>
> フォルダ同期処理の開始。同期タスクは`Ctrl + C`で停止します。

### トラブル

> #### RSync 時のエラー
>
> /distフォルダが存在しないとエラーになります。リポジトリをクローンした直後はフォルダがローカルにないので、手動で作成してください。
>
> #### Windows Vagrant2.0環境 バグフィックス
>
> Vagrant2.0のRSyncがエラーになる場合はソースコードの編集を。[参考文献](https://qiita.com/shimitei/items/d5910d196b90d2be576d#rsync%E3%81%A7%E3%81%AE%E3%82%A8%E3%83%A9%E3%83%BC)
>
> * 書き換えるファイル: Vagrant\embedded\gems\gems\vagrant-2.0.0\lib\vagrant\util\platform.rb
> * 修正コード: https://raw.githubusercontent.com/briancain/vagrant/3c9e1c9d84812c67119f2756629e47167604f28a/lib/vagrant/util/platform.rb
