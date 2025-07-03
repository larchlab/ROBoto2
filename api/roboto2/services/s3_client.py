import json
import boto3

def upload_json_to_s3(json_data, bucket_name, file_name):
    try:
        s3 = boto3.resource('s3')
        s3object = s3.Object(bucket_name, file_name)

        s3object.put(
            Body=(json_data.encode('UTF-8'))
        )
        
        return True
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        return None