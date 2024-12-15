import AndroidTelePorter
import sys
import os

def convert(dc, userID, authKey, outputPath):
    try:
        session = AndroidTelePorter.AndroidSession.from_manual(
            auth_key=bytes.fromhex(authKey),
            dc_id=int(dc),
            user_id=int(userID)
        )
        session.to_tdata(outputPath)
        sys.exit(0)
    except Exception as ex:
        print(ex)
        sys.exit(1)
    
if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Weird argument count")
        sys.exit(1)
        
    dc = sys.argv[1]
    userID = sys.argv[2]
    authKey = sys.argv[3]
    outputPath = sys.argv[4]
    
    convert(dc, userID, authKey, outputPath)