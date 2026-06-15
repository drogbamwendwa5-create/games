#!/usr/bin/env python3
"""Simple HTTP server to serve the Game Hub and all games.
Run this script, then open http://localhost:8000 in your browser.

Usage: python server.py
"""

import http.server
import socketserver
import sys
import os

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    # Change to the script's directory so relative paths work
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print(f"🎮 Game Hub Server Started!")
    print(f"")
    print(f"   Open in your browser:")
    print(f"   👉 http://localhost:{PORT}")
    print(f"")
    print(f"   Games available:")
    print(f"   🃏 Memory Match:  http://localhost:{PORT}/card/dist/")
    print(f"   ⚡ Reaction Time: http://localhost:{PORT}/reaction-game/dist/")
    print(f"   ♚ 3D Chess:      http://localhost:{PORT}/time/dist/")
    print(f"")
    print(f"Press Ctrl+C to stop the server.")

    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.server_close()