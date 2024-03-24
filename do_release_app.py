#!/usr/bin/env python3
import os
import sys
import re
import json
from collections import namedtuple
import mimetypes
import boto3


APP_UPDATE_JSON_FILE_NAME = 'app-update.json'
DO_REGION = 'ams3'
DO_BUCKET = 'freterium-backup'
DO_BUCKET_PATH = 'MobileApp'
APP_UPDATE_BASE_URL = 'https://files.freterium.com'


def info(message: str):
    print(f'* {message}')


ApkInfo = namedtuple('ApkInfo', ['local_path', 'file_name', 'version'])


def parse_apk_info(local_path: str) -> ApkInfo:
    file_name = os.path.basename(local_path)
    match = re.search('(\d+\.\d+\.\d+)(\.apk)$', file_name)
    version = match.group(1) if match is not None else ''

    return ApkInfo(
        local_path=local_path,
        file_name=file_name,
        version=version
    )


Config = namedtuple(
    'Config', ['region', 'bucket', 'bucket_path', 'access_key', 'secret_key'])

config = Config(
    region=os.getenv('DO_REGION', DO_REGION),
    bucket=os.getenv('DO_BUCKET', DO_BUCKET),
    bucket_path=os.getenv('DO_BUCKET_PATH', DO_BUCKET_PATH),
    access_key=os.getenv('DO_ACCESS_KEY', ''),
    secret_key=os.getenv('DO_SECRET_KEY', '')
)

if len(config.access_key) == 0:
    raise ValueError(
        f'Invalid s3 access key: env variable `DO_ACCESS_KEY` is required')

if len(config.secret_key) == 0:
    raise ValueError(
        f'Invalid s3 secret key: env variable `DO_SECRET_KEY` is required')

if len(sys.argv) != 2:
    raise ValueError(f'Invalid usage: {sys.argv[0]} <application_x.y.z.apk>')

apk = parse_apk_info(sys.argv[1])

if len(apk.file_name) == 0:
    raise ValueError(
        f'Invalid apk file name: `{apk.file_name}` parsed from `{apk.local_path}`')

if len(apk.version) == 0:
    raise ValueError(
        f'Invalid apk version: `{apk.version}` parsed from `{apk.local_path}`')

if len(config.bucket_path) > 0:
    target_apk_key = f'{config.bucket_path}/{apk.file_name}'
else:
    target_apk_key = f'{apk.file_name}'

app_update_url = f'{APP_UPDATE_BASE_URL}/{target_apk_key}'

info(f'using apk file name:  {apk.file_name}')
info(f'using apk version:    {apk.version}')
info(f'using s3 region:      {config.region}')
info(f'using s3 bucket:      {config.bucket}')
info(f'using s3 bucket path: {config.bucket_path}')
info(f'using app update url: {app_update_url}')
info('')

session = boto3.session.Session()

info(f'authenticating s3...')

client = session.client(
    's3',
    endpoint_url=f'https://{config.region}.digitaloceanspaces.com',
    region_name=config.region,
    aws_access_key_id=config.access_key,
    aws_secret_access_key=config.secret_key
)

info(f'uploading to {apk.local_path} to {config.bucket}/{target_apk_key}')

content_type = mimetypes.guess_type(
    apk.local_path)[0] or 'application/vnd.android.package-archive'

client.put_object(
    Bucket=config.bucket,
    Key=target_apk_key,
    Body=open(apk.local_path, 'rb'),
    ACL='public-read',
    ContentType=content_type
)

app_update_json = {
    'current': apk.version,
    'enabled': True,
    'url': app_update_url,
    'majorMsg': {
        'title': 'Important App Update',
        'msg': 'Please update your app to the latest version to continue using it',
        'button': 'Download'
    },
    'minorMsg': {
        'title': 'App Update available',
        'msg': 'There is a new version available, do you want to get it now ?',
        'button': 'Download'
    },
    'maintenanceMsg': {
        'title': 'App maintenance',
        'msg': 'We are currently imroving your app experience, please try later',
        'button': 'Ok'
    }
}

if len(config.bucket_path) > 0:
    target_json_key = f'{config.bucket_path}/{APP_UPDATE_JSON_FILE_NAME}'
else:
    target_json_key = f'{APP_UPDATE_JSON_FILE_NAME}'

info(f'uploading app update json to {target_json_key}')

client.put_object(
    Bucket=config.bucket,
    Key=target_json_key,
    Body=json.dumps(app_update_json).encode(),
    ACL='public-read',
    ContentType=mimetypes.guess_type(target_json_key)[0]
)

info(f'success, now flush cache')
