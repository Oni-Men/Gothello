#!/bin/sh

yarn build

cd ./src/server
go build -o gothello main.go

cp gothello ../../gothello.exe
rm gothello
