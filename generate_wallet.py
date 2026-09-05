from solders.keypair import Keypair

ai_wallet = Keypair()

print("=== СОХРАНИ ЭТИ ДАННЫЕ ===")
print(f"Public Key (Вставь в смарт-контракт): {ai_wallet.pubkey()}")
print(f"Private Key (Секретный массив для бэкенда): {ai_wallet.secret().hex()}")