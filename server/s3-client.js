import {get_accessKeys, S3, listObjects} from '294-aws-s3';

export const s3Client = new S3(get_accessKeys());
export const Bucket = 'cb-survey'
