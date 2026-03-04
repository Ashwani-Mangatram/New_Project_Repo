"""Start a local static server from this project directory on an available port."""

from __future__ import annotations

import http.server
import os
import socket
import socketserver
import sys
import webbrowser
from pathlib import Path

START_PORT = 4173


def find_open_port(start_port: int) -> int:
    port = start_port
    while port <= 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
        port += 1
    raise RuntimeError("Unable to find an open local port")


def main() -> None:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)

    if not Path("index.html").exists():
        print("Error: index.html not found in project directory.")
        sys.exit(1)

    port = find_open_port(START_PORT)
    url = f"http://localhost:{port}/index.html"

    print(f"Serving from: {project_dir}")
    print(f"Open this link: {url}")

    try:
        webbrowser.open(url)
    except Exception:
        pass

    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
