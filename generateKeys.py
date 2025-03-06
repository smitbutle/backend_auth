from ecies.utils import generate_key
import binascii

# Generate ECC private key
private_key = generate_key()
private_key_hex = binascii.hexlify(private_key.secret).decode()

# Generate corresponding public key
public_key_hex = private_key.public_key.format(True).hex()

# Save private key to private_key.txt
with open("private_key.txt", "w") as priv_file:
    priv_file.write(private_key_hex)

# Save public key to public_key.txt
with open("public_key.txt", "w") as pub_file:
    pub_file.write(public_key_hex)

print("🔑 ECC Key Pair Generated Successfully!")
print("Private Key (Saved to private_key.txt):", private_key_hex)
print("Public Key (Saved to public_key.txt):", public_key_hex)
