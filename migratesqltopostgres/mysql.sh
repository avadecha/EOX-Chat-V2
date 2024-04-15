#!/bin/bash

morph apply up --driver mysql --dsn "root:83fBG4vs[vm1@tcp(3.23.20.71:30008)/mattermost?charset=utf8mb4,utf8&readTimeout=30s&writeTimeout=30s" --path ../server/channels/db/migrations/mysql/ --number -1
./pgloader migration.load > migration.log
