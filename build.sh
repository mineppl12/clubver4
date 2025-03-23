#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # nvm 로드


git remote set-url origin https://github.com/mineppl12/clubver4.git
git pull origin main 
echo "깃 불러오기 끝"

echo "npm 실행"
nvm use 20.14.0
node -v
npm install 
npm run build
echo "빌드 끝"
