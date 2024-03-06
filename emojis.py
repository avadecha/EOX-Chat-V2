import json
import os
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mattermost server details
MATTERMOST_URL = 'https://eos.eoxvantage.com:9065/api/v4'
LOGIN_ID = 'admintest'
PASSWORD = '66d4aaa5ea177ac32c69946de3731ec0'
EMOJI_DIRECTORY = "~/eoxemojis"
USER_ID = ""
MIGRATE_TO_URL = "https://chatapptest.eoxvantage.com/api/v4"

def login(url = MATTERMOST_URL):
    global USER_ID
    """Authenticate with the Mattermost server."""
    login_url = f'{url}/users/login'
    payload = {'login_id': LOGIN_ID, 'password': PASSWORD}

    response = requests.post(login_url, json=payload)
    response.raise_for_status()  # Raise an exception for non-200 status codes
    USER_ID = response.json()["id"]
    return response.headers['Token']

def fetch_emojis(token):
    """Fetch custom emojis from the Mattermost server."""
    emoji_url = f'{MATTERMOST_URL}/emoji?page=0&per_page=1000'
    headers = {'Authorization': f'Bearer {token}'}

    response = requests.get(emoji_url, headers=headers)
    response.raise_for_status()
    print(response.json())
    return response.json()

def download_emoji_image(emoji, token):
    """Download the image associated with the emoji."""
    emoji_id = emoji['id']
    emoji_name = emoji['name']
    emoji_image_url = f"{MATTERMOST_URL}/emoji/{emoji_id}/image"

    response = requests.get(emoji_image_url, headers={'Authorization': f'Bearer {token}'})
    response.raise_for_status()

    content_type = response.headers['Content-Type']
    file_extension = 'png' if 'image/png' in content_type else 'gif'
    file_path = os.path.expanduser(os.path.join(EMOJI_DIRECTORY, f"{emoji_name}.{file_extension}"))

    with open(file_path, 'wb') as f:
        f.write(response.content)

    logger.info(f"Downloaded {emoji_name}.{file_extension}")


def post_emojis(token):
    emoji_directory = os.path.expanduser("~/eoxemojis")

    # Iterate over files in the directory
    for filename in os.listdir(emoji_directory):
        filepath = os.path.join(emoji_directory, filename)

        # Check if the file is a regular file and ends with .png or .gif
        if os.path.isfile(filepath) and (filename.endswith('.png') or filename.endswith('.gif')):
            # Set up the data for the POST request
            data = {
                'emoji': json.dumps({"name":  os.path.splitext(filename)[0] , "creator_id":  USER_ID  })
            }
            print(data)

            # Set up the files to be uploaded
            files = {
                'image': open(filepath, 'rb')
            }

            # Make the POST request
            response = requests.post(MIGRATE_TO_URL+"/emoji", headers={'Authorization': f'Bearer {token}'}, data=data, files=files)

            # Check if the request was successful
            if response.status_code == 201:
                print(f"Emoji {filename} created successfully.")
            else:
                print(f"Failed to create emoji {filename}. Status code:", response.status_code)
                print("Response:", response.text)

def main():
    try:
        os.makedirs(os.path.expanduser(EMOJI_DIRECTORY), exist_ok=True)
        token = login()
        emojis = fetch_emojis(token)
        for emoji in emojis:
            download_emoji_image(emoji, token)
        migrate_token = login(MIGRATE_TO_URL)
        post_emojis(migrate_token)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
