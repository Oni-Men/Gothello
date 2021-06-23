#!/bin/sh

#Build client-side
yarn build

cd ./src/server
go build -o gothello main.go

cp gothello ../../gothello.exe
rm gothello
