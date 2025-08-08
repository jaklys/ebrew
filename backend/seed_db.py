"""Seed DynamoDB with default mock brewing state."""
import boto3
from mock_data import DEFAULT_STATE
from config import AWS_REGION, DDB_TABLE

def main():
    dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
    table = dynamodb.Table(DDB_TABLE)
    table.put_item(Item={"id": "state", "payload": DEFAULT_STATE})
    print("Seeded DynamoDB table with default state")

if __name__ == "__main__":
    main()
