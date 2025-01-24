import sys
import os
import struct

def convert_to_tdata(dc_id, user_id, auth_key, output_path):
    try:
        print('start', flush=True)
        print(f"Parameters:", flush=True)
        print(f"DC ID: {dc_id}", flush=True)
        print(f"User ID: {user_id}", flush=True)
        print(f"Output path: {output_path}", flush=True)
        
        tdata_path = os.path.join(output_path, 'tdata')
        os.makedirs(tdata_path, exist_ok=True)
        print(f"Created tdata directory", flush=True)

        auth_key_bytes = bytes.fromhex(auth_key)
        print(f"Converted auth key", flush=True)

        key_file = os.path.join(tdata_path, f'key_dc_{dc_id}')
        with open(key_file, 'wb') as f:
            f.write(auth_key_bytes)
        print(f"Wrote key file", flush=True)

        settings_file = os.path.join(tdata_path, 'settings')
        with open(settings_file, 'wb') as f:
            f.write(struct.pack('<i', int(dc_id)))
        print(f"Wrote settings file", flush=True)

        print("Success!", flush=True)
        sys.exit(0)
    except Exception as ex:
        print(f"Error: {ex}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == "__main__":
    print("Script started!", flush=True)
    if len(sys.argv) != 5:
        print("Usage: python tdata.py <dc_id> <user_id> <auth_key> <output_path>", flush=True)
        sys.exit(1)
    
    dc_id = sys.argv[1]
    user_id = sys.argv[2]
    auth_key = sys.argv[3]
    output_path = sys.argv[4]
    
    convert_to_tdata(dc_id, user_id, auth_key, output_path)