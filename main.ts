<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Game Digital Nusantara - ONLINE MODE</title>

    <!-- Firebase Compat SDK (lebih mudah dipakai dengan vanilla JS) -->
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: url('gambar/background/bg1.png') no-repeat center center fixed;
            background-size: 100% 100%;
            min-height: 100vh;
            color: #fff;
            overflow: hidden;
        }

        /* ============================================ */
        /* PRE-LOADING SCREEN */
        /* ============================================ */
        #pre-loading-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: url('gambar/background/bg1.png') no-repeat center center;
            background-size: 100% 100%;
            z-index: 20000;
            transition: opacity 0.5s ease-out;
        }
        #pre-loading-screen.hidden { opacity: 0; pointer-events: none; }

        .pre-loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        }
        .pre-loading-title {
            font-size: 3em;
            font-weight: bold;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: titlePulse 2s ease-in-out infinite;
            margin: 0;
        }
        .pre-loading-subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin: 0;
        }
        .pre-loading-spinner {
            width: 80px; height: 80px;
            border: 8px solid rgba(255,255,255,0.3);
            border-top: 8px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .pre-loading-info {
            font-size: 1.1em;
            opacity: 0.8;
            margin: 0;
            min-height: 30px;
            animation: fadeInOut 2s ease-in-out infinite;
        }
        @keyframes fadeInOut { 0%,100%{opacity:0.8;} 50%{opacity:0.4;} }

        .btn-play {
            padding: 20px 80px;
            font-size: 2em;
            font-weight: bold;
            background: url('gambar/background/bg1.png') no-repeat center center;
            background-size: cover;
            color: white;
            border: 3px solid rgba(255,255,255,0.7);
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 3px;
            display: none;
            animation: playButtonAppear 0.5s ease-out;
            text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }
        @keyframes playButtonAppear { from{transform:scale(0);opacity:0;} to{transform:scale(1);opacity:1;} }
        .btn-play:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 15px 40px rgba(0,0,0,0.5); }


        /* Saat game aktif, body pakai gradient bukan bg1.png */
        body:has(.game-container.active) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            background-image: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }
        /* ============================================ */
        /* MATCHMAKING SCREEN */
        /* ============================================ */
        #matchmaking-screen {
            display: none;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 0;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: url('gambar/background/bg1.png') no-repeat center center;
            background-size: 100% 100%;
            z-index: 10000;
            overflow-y: auto;
        }
        #matchmaking-screen.active { display: flex; }
        #matchmaking-screen.hidden { display: none; }

        .matchmaking-container {
            background: transparent;
            padding: 0;
            border-radius: 0;
            -webkit-backdrop-filter: none; backdrop-filter: none;
            box-shadow: none;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .matchmaking-title {
            font-size: 2.5em;
            margin-bottom: 20px;
            animation: titlePulse 2s ease-in-out infinite;
        }
        .matchmaking-spinner {
            width: 70px; height: 70px;
            border: 7px solid rgba(255,255,255,0.3);
            border-top: 7px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        .matchmaking-waiting-box {
            background: rgba(30, 20, 80, 0.55);
            -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
            border: 2px solid rgba(255,255,255,0.18);
            border-radius: 28px;
            padding: 36px 56px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.35);
            margin-bottom: 40px;
        }
        .matchmaking-waiting-title {
            font-size: 1.8em;
            font-weight: bold;
            color: #fff;
            text-shadow: 0 2px 10px rgba(0,0,0,0.4);
            margin: 0;
        }
        .matchmaking-status { font-size: 1.1em; color: rgba(255,255,255,0.85); margin: 0; min-height: 24px; }
        .btn-cancel {
            margin-top: 8px; padding: 14px 50px;
            font-size: 1.15em; font-weight: bold;
            background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
            color: white; border: none; border-radius: 50px;
            cursor: pointer; transition: all 0.3s;
            box-shadow: 0 6px 20px rgba(244,67,54,0.5);
            letter-spacing: 1px;
        }
        .btn-cancel:hover { background: linear-gradient(135deg, #e53935 0%, #c62828 100%); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(244,67,54,0.6); }
        .btn-start {
            padding: 22px 80px; font-size: 1.8em; font-weight: bold;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white; border: none; border-radius: 50px; cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4); transition: all 0.3s ease;
            text-transform: uppercase; letter-spacing: 2px;
            margin-bottom: 20px;
        }
        .btn-start:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.5); }

        /* Bottom nav bar for menu buttons */
        .menu-bottom-nav {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px 20px 28px;
            background: transparent;
        }
        .menu-nav-scroll {
            display: flex;
            flex-direction: row;
            gap: 10px;
            overflow: hidden;
            width: calc(3 * 160px + 2 * 10px);
            flex-shrink: 0;
        }
        .menu-nav-scroll-inner {
            display: flex;
            flex-direction: row;
            gap: 10px;
            transition: transform 0.3s ease;
            will-change: transform;
        }
        .menu-nav-scroll-inner .btn-encyclopedia {
            flex: 0 0 160px;
            width: 160px;
            justify-content: center;
        }
        .btn-ensiklopedia-style {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
            box-shadow: 0 4px 14px rgba(67,233,123,0.4) !important;
            color: #0a3d1f !important;
        }
        .btn-teman-style {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            box-shadow: 0 4px 14px rgba(102,126,234,0.4) !important;
        }
        .btn-settings-style {
            background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%) !important;
            box-shadow: 0 4px 14px rgba(161,140,209,0.4) !important;
            color: #3d1a6e !important;
        }
        .menu-nav-arrow {
            background: rgba(255,255,255,0.18);
            border: none; border-radius: 50%;
            width: 36px; height: 36px;
            color: white; font-size: 1.1em;
            cursor: pointer; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
        }
        .menu-nav-arrow:hover { background: rgba(255,255,255,0.35); }
        @media (max-width: 560px) {
            .menu-nav-scroll {
                width: calc(2 * 120px + 10px);
            }
            .menu-nav-scroll-inner .btn-encyclopedia {
                flex: 0 0 120px;
                width: 120px;
                padding: 12px 8px;
                font-size: 0.82em;
            }
            .btn-start {
                padding: 16px 40px;
                font-size: 1.4em;
            }
        }
        @media (max-width: 390px) {
            .menu-nav-scroll {
                width: calc(2 * 100px + 10px);
            }
            .menu-nav-scroll-inner .btn-encyclopedia {
                flex: 0 0 100px;
                width: 100px;
                padding: 10px 6px;
                font-size: 0.76em;
            }
            .btn-start {
                padding: 14px 32px;
                font-size: 1.2em;
            }
            .menu-nav-arrow {
                width: 28px;
                height: 28px;
                font-size: 0.9em;
            }
        }

        /* ============================================ */
        /* GAME CONTAINER */
        /* ============================================ */
        .game-container {
            display: none;
            min-height: 100vh;
            flex-direction: column;
            max-width: 1800px;
            margin: 0 auto;
            padding: 10px;
        }
        .game-container.active { display: flex; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }

        .main-content {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px;
            flex: 0 0 auto;
            margin-bottom: 10px;
            width: 100%;
            box-sizing: border-box;
            align-items: start;
        }

        /* OPPONENTS PANEL */
        .opponents-panel {
            background: rgba(255,255,255,0.1);
            padding: 10px; border-radius: 10px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            overflow-y: auto;
            max-height: calc(100vh - 10px);
            height: fit-content;
        }
		
        /* PING PANEL */
        .left-column {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
        }
        .ping-panel {
            background: rgba(255,255,255,0.1);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 8px 10px;
        }
        .ping-title {
            font-size: 0.82em; font-weight: bold;
            text-align: center; margin-bottom: 7px;
            color: rgba(255,255,255,0.8);
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .ping-item {
            display: flex; align-items: center;
            justify-content: space-between; gap: 6px;
            font-size: 0.78em; padding: 4px 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ping-item:last-child { border-bottom: none; }
        .ping-name {
            overflow: hidden; text-overflow: ellipsis;
            white-space: nowrap; flex: 1; min-width: 0;
            color: rgba(255,255,255,0.85);
        }
        .ping-badge {
            font-size: 0.75em; font-weight: bold;
            padding: 2px 7px; border-radius: 10px;
            white-space: nowrap; flex-shrink: 0;
        }
        .ping-kuat   { background: rgba(76,175,80,0.25);  color: #81c784; border: 1px solid rgba(76,175,80,0.6);  }
        .ping-sedang { background: rgba(255,193,7,0.25);  color: #ffd54f; border: 1px solid rgba(255,193,7,0.6);  }
        .ping-lemah  { background: rgba(244,67,54,0.25);  color: #ef9a9a; border: 1px solid rgba(244,67,54,0.6);  }
        .ping-unknown{ background: rgba(158,158,158,0.2); color: #bdbdbd; border: 1px solid rgba(158,158,158,0.4);}

        .opponents-title {
            font-size: 1.1em; font-weight: bold;
            margin-bottom: 10px; text-align: center;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
        }
        .opponent-item {
            background: rgba(0,0,0,0.2);
            padding: 10px; border-radius: 8px; margin-bottom: 8px;
        }
        .opponent-item.active { background: rgba(76,175,80,0.3); border: 2px solid #4caf50; }
        .opponent-item.warning { background: rgba(244,67,54,0.3); border: 2px solid #f44336; }
        .opponent-item.human-player { border-left: 3px solid #4caf50; }
        .opponent-item.bot-player { border-left: 3px solid #ffc107; }
        .opponent-name { font-weight: bold; font-size: 1em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; overflow: hidden; }
        .opponent-stats { display: flex; gap: 8px; font-size: 0.85em; }
        .stat-badge { background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; flex: 1; text-align: center; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .status-dot.done { background: #4caf50; }
        .status-dot.waiting { background: #ffc107; animation: pulseDot 1s infinite; }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.05);opacity:0.9;} }

        /* PROVINCE PREVIEW (setelah lawan ditemukan) */
        #provinces-preview {
            background: rgba(10, 5, 40, 0.82);
            -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);
            border: 2px solid rgba(255,255,255,0.18);
            border-radius: 24px;
            padding: 30px 32px;
            max-width: 620px;
            width: 96%;
            text-align: center;
            margin: 0 auto;
            animation: fadeInUp 0.4s ease;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .prov-preview-title {
            font-size: 1.9em; font-weight: bold; color: #fff;
            margin-bottom: 6px;
        }
        .prov-preview-subtitle {
            font-size: 1.05em; color: rgba(255,255,255,0.65);
            margin-bottom: 20px;
        }
        .prov-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 22px;
        }
        .prov-chip {
            background: rgba(255,255,255,0.1);
            border: 1.5px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            padding: 10px 10px;
            font-size: 0.88em;
            color: #fff;
            display: flex; flex-direction: column; align-items: center; gap: 6px;
            text-align: center;
        }
        .prov-chip.mandatory {
            background: rgba(255, 200, 0, 0.18);
            border-color: #ffd700;
            color: #ffd700;
            font-weight: bold;
        }
        .prov-chip-icon { width: 64px; height: 44px; object-fit: contain; border-radius: 6px; flex-shrink: 0; }
        .prov-countdown {
            font-size: 1.2em; color: rgba(255,255,255,0.8);
        }
        .prov-countdown span { color: #ffd700; font-weight: bold; font-size: 1.4em; }

        /* RIGHT PANEL */
        .right-panel {
            display: flex; flex-direction: column; gap: 10px;
            width: 100%; box-sizing: border-box; min-height: 600px;
        }

        /* TOP CARD AREA */
        .top-card-area {
            background: rgba(255,255,255,0.1);
            padding: 15px; border-radius: 10px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            flex-shrink: 0; min-height: 225px; height: 225px;
            position: relative;
        }
        .province-label {
            text-align: center; font-size: 1.3em; font-weight: bold;
            margin-bottom: 10px; padding: 8px;
            background: rgba(255,255,255,0.2); border-radius: 8px;
        }
        .province-label-map {
            height: 28px; width: auto; max-width: 56px;
            object-fit: contain; vertical-align: middle;
            margin-right: 6px; display: inline-block;
        }
        .top-cards {
            display: flex; flex-wrap: wrap; gap: 10px;
            justify-content: center; align-items: center;
            min-height: 100px; width: 100%; padding: 2px; box-sizing: border-box;
        }

        /* PLAYER AREA */
        .player-area {
            background: rgba(255,255,255,0.15);
            padding: 15px; border-radius: 10px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            display: flex; flex-direction: column;
            width: 100%; box-sizing: border-box;
        }
        .player-header {
            display: flex; justify-content: flex-start; align-items: center;
            margin-bottom: 10px; padding-bottom: 10px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            width: 100%; box-sizing: border-box;
            flex-wrap: wrap; gap: 8px;
        }
        .player-stats { display: flex; gap: 12px; font-size: 0.95em; flex-wrap: wrap; align-items: center; }
        .player-stat { background: rgba(0,0,0,0.3); padding: 5px 12px; border-radius: 15px; }
        .player-deck-container {
            flex: 1; overflow-y: auto; overflow-x: hidden;
            min-height: 150px; max-height: 250px;
            width: 100%; box-sizing: border-box; padding: 0; margin: 0;
        }
        .player-deck {
            display: flex; gap: 10px; justify-content: center;
            flex-wrap: wrap; padding: 5px; min-height: 140px;
            align-items: flex-start; width: 100%; box-sizing: border-box;
        }
        .deck-slot {
            display: inline-flex; flex-direction: column;
            align-items: center; gap: 4px;
        }
        .deck-slot.zoom-in  { animation: cardZoomIn  0.4s ease-out forwards; }
        .deck-slot.zoom-out { animation: cardZoomOut 0.3s ease-in  forwards !important; pointer-events: none !important; }
        .deck-province-label {
            font-size: 0.63em; font-weight: 600;
            color: rgba(255,255,255,0.9);
            background: rgba(0,0,0,0.38);
            padding: 2px 7px; border-radius: 4px;
            max-width: 108px; white-space: nowrap;
            overflow: hidden; text-overflow: ellipsis;
            text-align: center; pointer-events: none;
        }
        .deck-province-label.hidden { display: none; }

        /* ============================================ */
        /* IN-GAME SETTINGS BUTTON & PANEL              */
        /* ============================================ */
        #btn-ingame-settings {
            position: fixed; bottom: 20px; left: 20px;
            width: 46px; height: 46px; border-radius: 50%;
            background: rgba(20, 15, 50, 0.72);
            -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
            border: 1.5px solid rgba(255,255,255,0.22);
            color: #fff; font-size: 1.25em;
            cursor: pointer; z-index: 9000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.45);
            transition: background 0.2s, transform 0.15s;
            display: flex; align-items: center; justify-content: center;
        }
        #btn-ingame-settings:hover { background: rgba(60,40,120,0.88); transform: scale(1.08); }

        #ingame-settings-panel {
            position: fixed; bottom: 76px; left: 14px;
            width: 292px;
            background: linear-gradient(150deg, #2a1f5c 0%, #17103a 100%);
            border: 1px solid rgba(255,255,255,0.17);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.55);
            z-index: 9001; overflow: hidden;
        }
        .igs-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 13px 16px;
            background: rgba(0,0,0,0.28);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .igs-title { color: #fff; font-weight: bold; font-size: 1em; }
        .igs-close-btn {
            background: rgba(244,67,54,0.82); color: #fff;
            border: none; border-radius: 8px;
            padding: 4px 11px; cursor: pointer; font-size: 0.85em; font-weight: bold;
        }
        .igs-close-btn:hover { background: #f44336; }
        .igs-body { padding: 14px 16px; max-height: 62vh; overflow-y: auto; }
        .igs-section-label {
            color: rgba(255,255,255,0.72); font-size: 0.8em;
            font-weight: bold; margin-bottom: 6px; display: block;
        }
        .igs-divider {
            border: none; border-top: 1px solid rgba(255,255,255,0.12);
            margin: 13px 0;
        }

        /* CARDS */
        .card {
            width: 108px; height: 152px; background: white;
            border-radius: 10px; padding: 6px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.4);
            cursor: pointer; transition: all 0.2s; color: #333;
            display: flex; flex-direction: column;
            position: relative; overflow: hidden;
            flex-shrink: 0;
            min-width: 108px; max-width: 108px;
            min-height: 152px; max-height: 152px;
        }
        .card:hover { transform: translateY(-8px) scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
        .card.mythic      { border: 2px solid #ff6d00; background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%); }
        .card.legendary   { border: 2px solid #ffd700; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); }
        .card.epic        { border: 2px solid #9c27b0; background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%); }
        .card.rareplus    { border: 2px solid #4338ca; background: linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%); }
        .card.rarestar    { border: 2px solid #2196f3; background: linear-gradient(135deg, #bbdefb 0%, #64b5f6 100%); }
        .card.rare        { border: 2px solid #00acc1; background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%); }
        .card.uncommon    { border: 2px solid #2e7d32; background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%); }
        .card.uncommonplus{ border: 2px solid #4caf50; background: linear-gradient(135deg, #dcedc8 0%, #aed581 100%); }
        .card.commonplus  { border: 2px solid #81c784; background: linear-gradient(135deg, #f1f8e9 0%, #c5e1a5 100%); }
        .card.common      { border: 2px solid #9e9e9e; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); }

        .card.selectable {
            border: 3px solid transparent;
            animation: cardGlowIn 0.6s ease-out 5s forwards, shakePause 3s ease-in-out 8s infinite;
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 10;
        }
        .card.selectable:hover {
            transform: translateY(-8px) scale(1.05) !important;
            animation-play-state: paused;
            box-shadow: 0 0 25px rgba(236,72,153,0.8), 0 0 40px rgba(236,72,153,0.6) !important;
            border-color: rgba(236,72,153,0.9) !important;
        }
        @keyframes cardGlowIn {
            from { box-shadow: none; border-color: transparent; }
            to   { box-shadow: 0 0 25px rgba(236,72,153,0.8), 0 0 40px rgba(236,72,153,0.6); border-color: rgba(236,72,153,0.9); }
        }
        .card.disabled { cursor: default; opacity: 1; }
        .card.locked { cursor: not-allowed; }
        .card.zoom-in { animation: cardZoomIn 0.4s ease-out forwards; }
        .card.zoom-out { animation: cardZoomOut 0.3s ease-in forwards !important; pointer-events: none !important; }
        .card.fly-to-top { animation: cardFlyToTop 0.5s ease-out forwards; position: absolute; z-index: 999; }
        .card.shake { animation: cardShake 0.3s ease-in-out; }
        .card.wrong-card { animation: cardShake 0.3s; border: 3px solid #f44336 !important; }
        .card.zoom-in, .card.zoom-out, .card.fly-to-top { pointer-events: none !important; }

        @keyframes shakePause {
            0%,10%{transform:translateX(0) rotate(0deg);}
            12%{transform:translateX(-8px) rotate(-3deg);}
            14%{transform:translateX(8px) rotate(3deg);}
            16%{transform:translateX(-8px) rotate(-3deg);}
            18%{transform:translateX(8px) rotate(3deg);}
            20%{transform:translateX(-6px) rotate(-2deg);}
            22%{transform:translateX(6px) rotate(2deg);}
            24%{transform:translateX(-4px) rotate(-1deg);}
            26%{transform:translateX(4px) rotate(1deg);}
            28%{transform:translateX(-2px) rotate(-0.5deg);}
            30%,100%{transform:translateX(0) rotate(0deg);}
        }
        @keyframes cardShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-10px);} 75%{transform:translateX(10px);} }
        @keyframes cardZoomIn { from{transform:scale(0);opacity:0;} to{transform:scale(1);opacity:1;} }
        @keyframes cardZoomOut { from{transform:scale(1);opacity:1;} to{transform:scale(0);opacity:0;} }
        @keyframes cardFlyToTop {
            0%{transform:scale(1) translateY(0);opacity:1;}
            50%{transform:scale(0.5) translateY(-100px);opacity:0.7;}
            100%{transform:scale(1) translateY(-200px);opacity:0;}
        }

        .card-image {
            width: 100%; height: 56px; background: rgba(0,0,0,0.1);
            border-radius: 6px; margin-bottom: 4px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; font-size: 2em;
        }
        .card-image img { width:100%; height:100%; object-fit: cover; object-position:center; border-radius:4px; }
        .card-rarity { position: absolute; top: 4px; right: 4px; font-size: 1.1em; }
        .card-name {
            font-size: 0.75em; font-weight: bold; text-align: center;
            line-height: 1.1; flex-grow: 1;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; text-overflow: ellipsis; word-wrap: break-word;
        }
        .card-type {
            font-size: 0.6em; text-align: center; color: #666;
            margin-top: 3px; padding-top: 3px;
            border-top: 1px solid rgba(0,0,0,0.1);
        }

        /* BUTTONS */
        button {
            padding: 10px 25px; font-size: 0.95em; font-weight: bold;
            border: none; border-radius: 8px; cursor: pointer;
            transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.4); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-draw { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }

        /* LOG AREA */
        .log-area {
            background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;
            max-height: 100px; overflow-y: auto; flex-shrink: 0;
            width: 100%; box-sizing: border-box; margin: 0;
        }
        .log-entry {
            padding: 4px 8px; margin: 2px 0;
            background: rgba(255,255,255,0.1); border-radius: 4px;
            font-size: 0.85em; border-left: 3px solid #667eea;
            animation: fadeInLog 0.3s ease-out;
        }
        @keyframes fadeInLog { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }

        /* BUTTONS (info & refresh) */
        .province-info-btn {
            position: absolute; top: 68px; left: 8px;
            width: 40px; height: 40px;
            background: rgba(255,255,255,0.3); border: 2px solid rgba(255,255,255,0.5);
            border-radius: 8px; display: none; align-items: center; justify-content: center;
            cursor: pointer; font-size: 1.4em; transition: all 0.3s;
            -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); z-index: 5; padding: 0; line-height: 1;
        }
        .province-info-btn:hover { background: rgba(255,255,255,0.5); transform: scale(1.1); }

        .sync-refresh-btn {
            position: absolute; top: 68px; right: 8px;
            width: 40px; height: 40px;
            background: rgba(102,126,234,0.8); border: 2px solid rgba(255,255,255,0.6);
            border-radius: 8px; display: none; align-items: center; justify-content: center;
            cursor: pointer; font-size: 1.4em; transition: all 0.3s;
            -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); z-index: 5; padding: 0; line-height: 1;
        }
        .sync-refresh-btn:hover { background: rgba(102,126,234,1); transform: scale(1.1) rotate(180deg); }
        .sync-refresh-btn.urgent { background: rgba(244,67,54,0.9); border-color: #fff; animation: pulseUrgent 1s ease-in-out infinite; }
        .sync-refresh-btn.success { background: rgba(76,175,80,0.9); border-color: #fff; }
        @keyframes pulseUrgent { 0%,100%{box-shadow:0 4px 10px rgba(244,67,54,0.4);transform:scale(1);} 50%{box-shadow:0 8px 25px rgba(244,67,54,0.8);transform:scale(1.05);} }

        /* PROCESSING NOTIFICATION */
        .processing-notification {
            display: none; position: fixed;
            top: 50%; left: 50%; transform: translate(-50%,-50%);
            background: rgba(0,0,0,0.95);
            padding: 30px 50px; border-radius: 15px;
            border: 3px solid #ffc107; z-index: 999;
            text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .processing-notification.active { display: block; animation: fadeInNotif 0.3s; }
        @keyframes fadeInNotif { from{opacity:0;transform:translate(-50%,-60%);} to{opacity:1;transform:translate(-50%,-50%);} }
        .processing-notification h3 { font-size: 1.5em; margin-bottom: 15px; color: #ffc107; }
        .processing-notification p { font-size: 1.1em; color: #fff; margin: 5px 0; }
        .spinner {
            border: 4px solid rgba(255,193,7,0.3); border-top: 4px solid #ffc107;
            border-radius: 50%; width: 50px; height: 50px;
            animation: spin 1s linear infinite; margin: 20px auto;
        }

        /* PROVINCE INFO MODAL */
        .province-info-modal {
            display: none; position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            justify-content: center; align-items: center;
            z-index: 2000; padding: 20px;
        }
        .province-info-modal.active { display: flex; }
        .province-info-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px; border-radius: 20px;
            max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            position: relative; animation: slideIn 0.4s;
        }
        .province-info-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 20px; padding-bottom: 15px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
        }
        .province-info-header h2 { font-size: 1.8em; color: #fff; margin: 0; }
        .province-info-close {
            width: 40px; height: 40px;
            background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 1.5em; color: #fff; transition: all 0.3s;
        }
        .province-info-close:hover { background: rgba(255,255,255,0.4); transform: rotate(90deg); }
        .province-cards-grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; padding: 20px 10px 10px; }
        .province-info-card {
            width: 108px; height: 152px; background: white; border-radius: 10px;
            padding: 6px; box-shadow: 0 6px 12px rgba(0,0,0,0.4); cursor: pointer;
            transition: all 0.3s; color: #333; display: flex; flex-direction: column;
            position: relative; overflow: visible; flex-shrink: 0; margin-top: 15px;
        }
        .province-info-card:hover { transform: translateY(-8px) scale(1.05); }
        .province-info-card.mythic      { border: 2px solid #ff6d00; background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%); }
        .province-info-card.legendary   { border: 2px solid #ffd700; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); }
        .province-info-card.epic        { border: 2px solid #9c27b0; background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%); }
        .province-info-card.rareplus    { border: 2px solid #4338ca; background: linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%); }
        .province-info-card.rarestar    { border: 2px solid #2196f3; background: linear-gradient(135deg, #bbdefb 0%, #64b5f6 100%); }
        .province-info-card.rare        { border: 2px solid #00acc1; background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%); }
        .province-info-card.uncommon    { border: 2px solid #2e7d32; background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%); }
        .province-info-card.uncommonplus{ border: 2px solid #4caf50; background: linear-gradient(135deg, #dcedc8 0%, #aed581 100%); }
        .province-info-card.commonplus  { border: 2px solid #81c784; background: linear-gradient(135deg, #f1f8e9 0%, #c5e1a5 100%); }
        .province-info-card.common      { border: 2px solid #9e9e9e; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); }
        .province-info-card-rarity { position: absolute; top: 4px; right: 4px; font-size: 1.1em; }
        .province-info-card-image { width:100%; height:60px; background:rgba(0,0,0,0.1); border-radius:6px; margin-bottom:5px; display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:2em; }
        .province-info-card-image img { width:100%; height:100%; object-fit:contain; border-radius:4px; }
        .province-info-card-name { font-size:0.75em; font-weight:bold; text-align:center; line-height:1.1; flex-grow:1; display:flex; align-items:center; justify-content:center; overflow:hidden; text-overflow:ellipsis; word-wrap:break-word; }
        .province-info-card-type { font-size:0.6em; text-align:center; color:#666; margin-top:3px; padding-top:3px; border-top:1px solid rgba(0,0,0,0.1); }
        .province-info-card-owned {
            position: absolute; top: 4px; left: 4px;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white; padding: 3px 7px; border-radius: 10px;
            font-size: 0.62em; font-weight: bold; box-shadow: 0 2px 6px rgba(76,175,80,0.5);
            z-index: 10; white-space: nowrap; border: 1.5px solid #2e7d32;
        }

        /* GAME OVER MODAL */
        .modal {
            display: none; position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            justify-content: center; align-items: center; z-index: 1000;
        }
        .modal.active { display: flex; }
        .modal-content {
            background: white; padding: 20px 24px; border-radius: 16px;
            text-align: center; color: #333; max-width: 500px; width: 92%;
            max-height: 90vh; overflow-y: auto;
            animation: slideIn 0.4s;
        }
        @keyframes slideIn { from{transform:translateY(-50px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        .modal-content h2 { font-size: 1.5em; margin-bottom: 6px; color: #667eea; }
        .rankings { margin: 10px 0; font-size: 0.92em; }
        .ranking-item { padding: 7px 10px; margin: 4px 0; background: #f5f5f5; border-radius: 8px; font-weight: bold; }
        .ranking-item.winner { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
        .ranking-item.loser { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
        /* Rank change card in game-over modal */
        .rank-change-card {
            background: rgba(102,126,234,0.13);
            border: 1px solid rgba(102,126,234,0.35);
            border-radius: 12px; padding: 10px 10px; margin-top: 8px; text-align: center;
        }
        .rank-change-title {
            font-size: 0.88em; font-weight: bold; margin-bottom: 8px; color: #667eea;
        }
        .rank-change-body {
            display: flex; align-items: center; justify-content: center;
            gap: 10px; flex-wrap: wrap;
        }
        .rank-change-item {
            display: flex; flex-direction: column; align-items: center; gap: 2px;
            font-size: 0.78em; font-weight: bold; color: #222;
        }
        .rank-change-img { width: 44px; height: 44px; object-fit: contain; border-radius: 6px; }
        .rank-change-arrow { font-size: 1.1em; font-weight: bold; color: #444; }
        .rank-pts-old { font-size: 0.74em; color: #555; }
        .rank-pts-new { font-size: 0.74em; color: #555; }
        .rank-change-delta-pos { color: #2e7d32; font-weight: bold; }
        .rank-change-delta-neg { color: #c62828; font-weight: bold; }

        /* BADGES & NOTIFICATIONS */
        .warning-badge {
            background: #f44336; color: white;
            padding: 3px 10px; border-radius: 12px;
            font-size: 0.8em; font-weight: bold;
            animation: blink 1s infinite;
        }
        @keyframes blink { 0%,50%,100%{opacity:1;} 25%,75%{opacity:0.6;} }

        .game-notification {
            font-family: 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.4;
        }

        @keyframes slideInRight { from{transform:translateX(400px);opacity:0;} to{transform:translateX(0);opacity:1;} }
        @keyframes slideOutRight { from{transform:translateX(0);opacity:1;} to{transform:translateX(400px);opacity:0;} }
        @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @keyframes titlePulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }

        /* TOAST NOTIFICATIONS */
        #toast-container {
            position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
            display: flex; flex-direction: column-reverse; align-items: center;
            gap: 10px; z-index: 99999; pointer-events: none;
        }
        .toast {
            min-width: 260px; max-width: 380px; padding: 13px 22px;
            border-radius: 12px; font-size: 0.92em; font-weight: bold; color: #fff;
            box-shadow: 0 6px 24px rgba(0,0,0,0.4); pointer-events: all;
            text-align: center; line-height: 1.4; word-break: break-word;
            animation: toastIn .25s ease;
        }
        .toast-error   { background: linear-gradient(135deg,#e53935,#c62828); }
        .toast-warning { background: linear-gradient(135deg,#fb8c00,#e65100); }
        .toast-success { background: linear-gradient(135deg,#43a047,#2e7d32); }
        .toast-info    { background: linear-gradient(135deg,#667eea,#764ba2); }
        @keyframes toastIn  { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0);} to{opacity:0;transform:translateY(20px);} }

        /* Matchmaking countdown */
        .matchmaking-bot-countdown {
            font-size: 0.78em; color: rgba(255,255,255,0.5);
            margin-top: 8px; text-align: center; letter-spacing: 0.02em;
        }

        /* ============================================ */
        /* AUTH SCREEN (Login & Register) */
        /* ============================================ */
        #auth-screen {
            display: none;   /* ← Diubah agar tersembunyi secara default */
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: url('gambar/background/bg1.png') no-repeat center center;
            background-size: 100% 100%;
            z-index: 30000;
        }
        .auth-container {
            background: rgba(255,255,255,0.15);
            padding: 40px;
            border-radius: 20px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
        }
        .auth-title { font-size: 2em; font-weight: bold; margin-bottom: 30px; }
        .auth-tabs { display: flex; margin-bottom: 25px; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 4px; }
        .auth-tab {
            flex: 1; padding: 10px; border: none; border-radius: 8px;
            cursor: pointer; font-size: 1em; font-weight: bold;
            background: transparent; color: rgba(255,255,255,0.7); transition: all 0.3s;
        }
        .auth-tab.active { background: rgba(255,255,255,0.3); color: #fff; }
        .auth-input {
            width: 100%; padding: 14px 18px; margin-bottom: 15px;
            border: 2px solid rgba(255,255,255,0.3); border-radius: 10px;
            background: rgba(255,255,255,0.15); color: #fff;
            font-size: 1em; outline: none; box-sizing: border-box;
            transition: border-color 0.3s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.6); }
        .auth-input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.2); }
        .btn-auth {
            width: 100%; padding: 15px; font-size: 1.1em; font-weight: bold;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white; border: none; border-radius: 10px;
            cursor: pointer; transition: all 0.3s; margin-top: 5px;
        }
        .btn-auth:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(76,175,80,0.4); }
        .auth-error {
            background: rgba(244,67,54,0.3); border: 1px solid rgba(244,67,54,0.6);
            padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;
            font-size: 0.9em; display: none;
        }
        .auth-loading { font-size: 0.95em; opacity: 0.8; margin-top: 15px; display: none; }

        /* ============================================ */
        /* NICKNAME SCREEN */
        /* ============================================ */
        #nickname-screen {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 30000;
        }

        #avatar-setup-screen {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 30000;
            overflow-y: auto;
        }
        .avatar-setup-container {
            background: rgba(255,255,255,0.15);
            padding: 36px 36px 28px;
            border-radius: 20px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            width: 100%; max-width: 420px;
        }
        .avatar-setup-preview {
            width: 90px; height: 90px;
            border-radius: 16px;
            overflow: hidden;
            margin: 0 auto 18px;
            border: 3px solid rgba(255,255,255,0.5);
            box-shadow: 0 0 20px rgba(255,255,255,0.2);
        }
        .avatar-setup-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nickname-container {
            background: rgba(255,255,255,0.15);
            padding: 40px;
            border-radius: 20px;
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            width: 100%; max-width: 400px;
        }
        .nickname-title { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .nickname-subtitle { font-size: 1em; opacity: 0.8; margin-bottom: 25px; }
        .nickname-rule {
            background: rgba(0,0,0,0.2); padding: 10px 15px; border-radius: 8px;
            font-size: 0.85em; opacity: 0.8; margin-bottom: 20px; text-align: left;
            line-height: 1.6;
        }

        /* ============================================ */
        /* PROFILE BADGE (pojok kanan atas) */
        /* ============================================ */
        #profile-badge {
            display: none;
            position: fixed;
            top: 12px; right: 15px;
            background: rgba(0,0,0,0.6);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 12px;
            padding: 8px 14px;
            z-index: 10001;
            cursor: pointer;
            transition: all 0.3s;
            min-width: 160px;
        }
        #profile-badge:hover { background: rgba(0,0,0,0.8); border-color: rgba(255,255,255,0.5); }
        .profile-badge-inner { display: flex; align-items: center; gap: 10px; }
        .profile-avatar {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 8px; display: flex; align-items: center; justify-content: center;
            font-size: 1.2em; font-weight: bold; flex-shrink: 0; overflow: hidden;
            border: 2px solid rgba(240,147,251,0.8);
            box-shadow: 0 0 8px rgba(240,147,251,0.5);
        }
        .profile-info { display: flex; flex-direction: column; align-items: flex-start; }
        .profile-nickname { font-size: 0.95em; font-weight: bold; color: #fff; line-height: 1.2; }
        .profile-id { font-size: 0.7em; color: rgba(255,255,255,0.6); font-family: monospace; }
        .profile-status {
            width: 8px; height: 8px; border-radius: 50%;
            background: #4caf50; margin-left: auto; flex-shrink: 0;
            box-shadow: 0 0 6px rgba(76,175,80,0.8);
        }
        .profile-avatar img { width: 100%; height: 100%; border-radius: 0; object-fit: cover; }

        /* ============================================ */
        /* AVATAR PICKER OVERLAY                        */
        /* ============================================ */
        #avatar-picker-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.75); z-index: 20000;
            align-items: center; justify-content: center;
        }
        #avatar-picker-box {
            background: #1a1a2e;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 20px; padding: 28px 28px 20px;
            width: 340px; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        #avatar-picker-box h3 { color: #fff; margin: 0 0 20px; font-size: 1.1em; }
        .avatar-grid {
            display: grid; grid-template-columns: repeat(3, 1fr);
            gap: 12px; margin-bottom: 20px;
        }
        .avatar-option {
            width: 84px; height: 84px; border-radius: 14px; overflow: hidden;
            cursor: pointer; border: 3px solid transparent;
            transition: all 0.2s; margin: auto;
        }
        .avatar-option img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .avatar-option:hover { border-color: rgba(240,147,251,0.8); transform: scale(1.07); }
        .avatar-option.selected {
            border-color: #f5576c;
            box-shadow: 0 0 16px rgba(245,87,108,0.7);
            transform: scale(1.07);
        }
        #btn-avatar-close {
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            color: #fff; padding: 9px 24px; border-radius: 10px;
            cursor: pointer; font-size: 0.9em; transition: background 0.2s;
        }
        #btn-avatar-close:hover { background: rgba(255,255,255,0.2); }
        .btn-change-avatar {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(240,147,251,0.15); border: 1px solid rgba(240,147,251,0.4);
            color: #f093fb; padding: 7px 16px; border-radius: 10px;
            cursor: pointer; font-size: 0.85em; margin: 10px 0 4px;
            transition: all 0.2s;
        }
        .btn-change-avatar:hover { background: rgba(240,147,251,0.28); }

        /* ============================================ */
        /* AUTO MODE INDICATOR */
        /* ============================================ */
        .campus-logo {
            position: absolute;
            top: 12px;
            left: 12px;
            width: 72px;
            height: 72px;
            object-fit: contain;
            border-radius: 8px;
            z-index: 5;
            pointer-events: none;
        }

        #auto-mode-indicator {
            display: none;
            position: fixed;
            bottom: 20px; right: 20px;
            background: rgba(244,67,54,0.9);
            border: 2px solid #f44336;
            border-radius: 12px;
            padding: 10px 18px;
            z-index: 9998;
            font-weight: bold;
            font-size: 0.9em;
            animation: pulseUrgent 1.5s ease-in-out infinite;
        }
        /* ============================================ */
        /* ENSIKLOPEDIA */
        /* ============================================ */
        .btn-encyclopedia {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; font-size: 0.95em; font-weight: bold;
            padding: 12px 22px; border-radius: 30px;
            margin-top: 0; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            width: auto; border: none;
            box-shadow: 0 4px 14px rgba(102,126,234,0.4);
            letter-spacing: 0.3px; cursor: pointer; transition: all 0.2s;
            white-space: nowrap;
            text-align: center;
        }
        .btn-encyclopedia:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(102,126,234,0.6); }
        .btn-leaderboard {
            background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%) !important;
            box-shadow: 0 4px 14px rgba(247,151,30,0.5) !important;
            color: #3d2000 !important;
        }
        .btn-leaderboard:hover { box-shadow: 0 8px 22px rgba(255,210,0,0.7) !important; }

        /* ===== LEADERBOARD SCREEN ===== */
        #leaderboard-screen {
            display: none; position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 15000; overflow-y: auto;
        }
        .lb-item {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 14px; padding: 12px 16px;
            margin-bottom: 10px; display: flex;
            align-items: center; gap: 12px;
        }
        .lb-item.lb-top1 { background: linear-gradient(135deg,rgba(255,215,0,0.3) 0%,rgba(255,180,0,0.15) 100%); border-color: rgba(255,215,0,0.5); }
        .lb-item.lb-top2 { background: linear-gradient(135deg,rgba(192,192,192,0.3) 0%,rgba(160,160,160,0.15) 100%); border-color: rgba(200,200,200,0.5); }
        .lb-item.lb-top3 { background: linear-gradient(135deg,rgba(205,127,50,0.3) 0%,rgba(170,100,30,0.15) 100%); border-color: rgba(205,127,50,0.5); }
        .lb-item.lb-self  { border-color: rgba(102,126,234,0.8); box-shadow: 0 0 12px rgba(102,126,234,0.4); }
        .lb-pos {
            font-size: 1em; font-weight: bold; color: rgba(255,255,255,0.7);
            min-width: 28px; text-align: center;
        }
        .lb-pos.gold   { color: #ffd700; font-size: 1.2em; }
        .lb-pos.silver { color: #c0c0c0; font-size: 1.1em; }
        .lb-pos.bronze { color: #cd7f32; font-size: 1.1em; }
        .lb-rank-img { width: 42px; height: 42px; object-fit: contain; flex-shrink: 0; }
        .lb-avatar { width: 38px; height: 38px; border-radius: 7px; object-fit: cover; display: block; }
        .lb-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .lb-name { font-size: 0.95em; font-weight: bold; color: #fff; }
        .lb-rank-label { font-size: 0.78em; color: rgba(255,255,255,0.7); }
        .lb-self-tag { font-size: 0.7em; background: rgba(102,126,234,0.7); color: #fff; border-radius: 6px; padding: 1px 7px; margin-left: 6px; }

        #encyclopedia-screen {
            display: none; position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 15000; overflow-y: auto;
        }
        .enc-header {
            background: rgba(255,255,255,0.15); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.25);
            padding: 16px 20px; display: flex; align-items: center;
            justify-content: space-between; position: sticky; top: 0; z-index: 100;
        }
        .enc-title { font-size: 1.4em; font-weight: bold; color: #fff; }
        .btn-enc-close {
            background: rgba(244,67,54,0.85); color: #fff;
            border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;
            padding: 8px 18px; font-size: 0.9em; font-weight: bold;
        }
        .btn-enc-close:hover { background: #f44336; transform: none; box-shadow: none; }

        .enc-tabs { display: flex; gap: 8px; padding: 20px 20px 0; }
        .enc-tab {
            flex: 1; max-width: 200px; padding: 12px 10px;
            border-radius: 14px 14px 0 0; font-size: 1em; font-weight: bold;
            cursor: pointer; border: none;
            background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.65);
            transition: all 0.2s; box-shadow: none;
        }
        .enc-tab.active { background: rgba(255,255,255,0.30); color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .enc-tab:hover:not(.active) { background: rgba(255,255,255,0.22); color: #fff; transform: none; box-shadow: none; }

        .enc-tab-content { display: none; padding: 20px; }
        .enc-tab-content.active { display: block; }

        .enc-province-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; position: relative; }
        .enc-prov-btn {
            background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9);
            border: 1px solid rgba(255,255,255,0.3); border-radius: 20px;
            padding: 7px 16px; font-size: 0.8em; font-weight: bold;
            cursor: pointer; transition: all 0.2s; box-shadow: none;
        }
        .enc-prov-btn:hover { background: rgba(255,255,255,0.25); color: #fff; transform: none; box-shadow: none; }
        .enc-prov-btn.active { background: linear-gradient(135deg,#f093fb 0%,#f5576c 100%); color: #fff; border-color: transparent; box-shadow: 0 3px 10px rgba(0,0,0,0.25); }

        /* Dropdown provinsi */
        .enc-prov-dropdown-wrap { position: relative; display: inline-block; }
        .enc-prov-dropdown-btn {
            background: rgba(255,255,255,0.15); color: #fff;
            border: 1px solid rgba(255,255,255,0.35); border-radius: 20px;
            padding: 9px 20px; font-size: 0.88em; font-weight: bold;
            cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: all 0.2s; box-shadow: none; white-space: nowrap;
        }
        .enc-prov-dropdown-btn:hover { background: rgba(255,255,255,0.25); }
        .enc-prov-dropdown-btn.open { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.6); }
        .enc-prov-arrow { transition: transform 0.25s; display: inline-block; font-style: normal; }
        .enc-prov-dropdown-btn.open .enc-prov-arrow { transform: rotate(180deg); }
        .enc-prov-list {
            display: none; position: absolute; top: calc(100% + 8px); left: 0;
            background: linear-gradient(160deg, #3a2d6e 0%, #1a1040 100%);
            border: 1px solid rgba(255,255,255,0.2); border-radius: 14px;
            min-width: 220px; max-height: 320px; overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 500;
            padding: 6px;
        }
        .enc-prov-list.open { display: block; animation: encDropDown 0.2s ease; }
        @keyframes encDropDown { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .enc-prov-list-item {
            padding: 9px 14px; border-radius: 10px; cursor: pointer;
            font-size: 0.85em; font-weight: bold; color: rgba(255,255,255,0.85);
            transition: background 0.15s;
        }
        .enc-prov-list-item:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .enc-prov-list-item.active { background: linear-gradient(135deg,#f093fb 0%,#f5576c 100%); color: #fff; }

        .enc-province-section { margin-bottom: 36px; }
        .enc-province-name {
            font-size: 1.15em; font-weight: bold; color: #fff;
            margin-bottom: 14px; padding: 10px 16px;
            background: rgba(255,255,255,0.15); border-radius: 10px;
            border-left: 4px solid rgba(255,255,255,0.6);
            display: flex; align-items: center; gap: 10px;
            -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
        }
        .enc-province-img {
            height: 48px;
            width: auto;
            max-width: 90px;
            border-radius: 6px;
            object-fit: contain;
            flex-shrink: 0;
            background: rgba(255,255,255,0.1);
        }
        .enc-cards-row { display: flex; flex-wrap: wrap; gap: 14px; padding-left: 4px; }
        .enc-card-wrapper { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .enc-power-badge {
            font-size: 0.72em; background: rgba(255,255,255,0.2); color: #fff;
            border: 1px solid rgba(255,255,255,0.35); border-radius: 8px;
            padding: 3px 10px; font-weight: bold;
        }
        .enc-rarity-badge {
            font-size: 0.68em; font-weight: bold;
            border-radius: 8px; padding: 3px 10px;
            border: 1px solid transparent;
        }
        .enc-rarity-badge.mythic      { background: linear-gradient(135deg,#fff3e0,#ff6d00); color: #fff; border-color: #ff6d00; }
        .enc-rarity-badge.legendary   { background: linear-gradient(135deg,#fff9c4,#ffd700); color: #5d4037; border-color: #ffd700; }
        .enc-rarity-badge.epic        { background: linear-gradient(135deg,#e1bee7,#9c27b0); color: #fff; border-color: #9c27b0; }
        .enc-rarity-badge.rareplus    { background: linear-gradient(135deg,#818cf8,#4338ca); color: #fff; border-color: #4338ca; }
        .enc-rarity-badge.rarestar    { background: linear-gradient(135deg,#bbdefb,#2196f3); color: #fff; border-color: #2196f3; }
        .enc-rarity-badge.rare        { background: linear-gradient(135deg,#e0f7fa,#00acc1); color: #fff; border-color: #00acc1; }
        .enc-rarity-badge.uncommon    { background: linear-gradient(135deg,#c8e6c9,#2e7d32); color: #fff; border-color: #2e7d32; }
        .enc-rarity-badge.uncommonplus{ background: linear-gradient(135deg,#dcedc8,#4caf50); color: #1b5e20; border-color: #4caf50; }
        .enc-rarity-badge.commonplus  { background: linear-gradient(135deg,#f1f8e9,#81c784); color: #1b5e20; border-color: #81c784; }
        .enc-rarity-badge.common      { background: linear-gradient(135deg,#f5f5f5,#9e9e9e); color: #424242; border-color: #9e9e9e; }

        .enc-rules-container { max-width: 680px; margin: 0 auto; }
        .enc-rules-title { text-align: center; font-size: 1.5em; font-weight: bold; margin-bottom: 8px; color: #fff; }
        .enc-rules-subtitle { text-align: center; font-size: 0.9em; color: rgba(255,255,255,0.7); margin-bottom: 28px; }
        .enc-rule-card {
            background: rgba(255,255,255,0.15); border-radius: 16px;
            padding: 20px 22px; margin-bottom: 14px;
            border-left: 5px solid rgba(255,255,255,0.5);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .enc-rule-icon { font-size: 2em; margin-bottom: 8px; display: block; }
        .enc-rule-heading { font-size: 1.05em; font-weight: bold; color: #fff; margin-bottom: 8px; }
        .enc-rule-text { font-size: 0.92em; color: rgba(255,255,255,0.88); line-height: 1.8; }
        .enc-rarity-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .enc-rarity-chip { padding: 5px 14px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }

        /* ============================================ */
        /* PROFILE SCREEN */
        /* ============================================ */
        #profile-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 15000; flex-direction: row;
        }
        #profile-sidebar {
            width: 180px; flex-shrink: 0;
            background: rgba(0,0,0,0.25);
            border-right: 1px solid rgba(255,255,255,0.15);
            display: flex; flex-direction: column;
            padding: 20px 12px; gap: 10px;
            overflow-y: auto;
        }
        .profile-tab {
            background: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.8);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px; padding: 14px 12px;
            font-size: 0.9em; font-weight: bold;
            text-align: left; cursor: pointer;
            transition: all 0.2s;
        }
        .profile-tab:hover { background: rgba(255,255,255,0.2); color: #fff; }
        .profile-tab.active {
            background: rgba(255,255,255,0.25);
            color: #fff; border-color: rgba(255,255,255,0.5);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        #btn-profile-back {
            position: absolute;
            top: 12px; right: 15px;
            width: 36px; height: 36px;
            background: rgba(244,67,54,0.85);
            color: #fff; border: 2px solid rgba(255,255,255,0.4);
            border-radius: 50%; font-size: 1.2em;
            font-weight: bold; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            z-index: 10; padding: 0; line-height: 1;
            box-shadow: 0 2px 8px rgba(244,67,54,0.4);
        }
        #btn-profile-back:hover { background: #f44336; transform: scale(1.1); box-shadow: 0 4px 14px rgba(244,67,54,0.6); }
        #profile-content { flex: 1; overflow-y: auto; padding: 30px; }
        .profile-panel { display: none; }
        .profile-panel.active { display: block; }
        .profile-panel-title {
            font-size: 1.4em; font-weight: bold; color: #fff;
            margin-bottom: 24px; padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.25);
        }
        .profile-info-row {
            display: flex; align-items: flex-start;
            padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.12);
            gap: 16px;
        }
        .profile-info-label { min-width: 130px; color: rgba(255,255,255,0.65); font-size: 0.9em; }
        .profile-info-value { color: #fff; font-weight: bold; font-size: 0.95em; word-break: break-all; }
        .profile-stat-card {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 14px; padding: 16px 20px;
            margin-bottom: 10px; display: flex;
            justify-content: space-between; align-items: center;
        }
        .profile-stat-label { color: rgba(255,255,255,0.8); font-size: 0.9em; }
        .profile-stat-value { font-size: 1.25em; font-weight: bold; color: #fff; }
        .profile-stat-value.highlight { color: #ffd700; }
        .profile-history-item {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 12px; padding: 12px 16px;
            margin-bottom: 10px; display: flex;
            flex-direction: column; gap: 8px;
        }
        .phi-header { display: flex; justify-content: space-between; align-items: center; }
        .phi-result { font-size: 0.95em; font-weight: bold; color: #fff; }
        .phi-pts.plus  { font-size: 0.95em; font-weight: bold; color: #4ade80; }
        .phi-pts.minus { font-size: 0.95em; font-weight: bold; color: #f87171; }
        .phi-pts.zero  { font-size: 0.95em; font-weight: bold; color: rgba(255,255,255,0.5); }
        .phi-rank-row { display: flex; align-items: center; gap: 8px; }
        .phi-rank-side { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 72px; }
        .phi-rank-img { width: 38px; height: 38px; object-fit: contain; }
        .phi-rank-name { font-size: 0.72em; color: #fff; text-align: center; line-height: 1.2; }
        .phi-rank-pts  { font-size: 0.7em; color: rgba(255,255,255,0.65); }
        .phi-arrow { font-size: 1.1em; color: rgba(255,255,255,0.55); flex-shrink: 0; }
        .phi-date { margin-left: auto; font-size: 0.72em; color: rgba(255,255,255,0.5); align-self: flex-end; }

        /* ===== RANK INFO BUTTON & MODAL ===== */
        .btn-rank-info {
            background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35);
            border-radius: 50%; width: 20px; height: 20px; font-size: 0.75em;
            cursor: pointer; padding: 0; line-height: 1; display: inline-flex;
            align-items: center; justify-content: center; flex-shrink: 0;
            transition: background 0.2s;
        }
        .btn-rank-info:hover { background: rgba(255,255,255,0.35); }
        .rank-info-modal {
            background: linear-gradient(160deg, #2d1b69 0%, #11998e 100%);
            border: 1px solid rgba(255,255,255,0.2); border-radius: 18px;
            max-width: 520px; margin: 20px auto; padding: 0 0 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .rank-info-header {
            background: rgba(255,255,255,0.12); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            border-radius: 18px 18px 0 0; padding: 16px 20px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .rank-info-title { font-size: 1.2em; font-weight: bold; color: #fff; }
        .rank-info-section-title {
            font-size: 0.85em; font-weight: bold; color: rgba(255,255,255,0.8);
            text-transform: uppercase; letter-spacing: 0.05em;
            padding: 16px 20px 8px;
        }
        .rank-info-list {
            display: flex; flex-wrap: wrap; gap: 8px; padding: 0 20px 4px;
        }
        .ri-rank-badge {
            font-size: 0.78em; color: #fff; border: 1px solid;
            border-radius: 20px; padding: 4px 12px; white-space: nowrap;
        }
        .rank-info-table {
            width: calc(100% - 40px); margin: 0 20px;
            border-collapse: collapse; font-size: 0.85em;
        }
        .rank-info-table th {
            background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9);
            padding: 8px 6px; text-align: center; font-size: 0.85em;
        }
        .rank-info-table th:first-child { text-align: left; border-radius: 8px 0 0 0; }
        .rank-info-table th:last-child  { border-radius: 0 8px 0 0; }
        .rank-info-table td {
            padding: 8px 6px; text-align: center; color: #fff;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .rank-info-table td.plus  { color: #4ade80; font-weight: bold; }
        .rank-info-table td.minus { color: #f87171; font-weight: bold; }
        .ri-tier { text-align: left !important; font-weight: bold; padding-left: 8px !important; }
        .ri-tier.bronze  { color: #cd7f32; }
        .ri-tier.silver  { color: #c0c0c0; }
        .ri-tier.gold    { color: #ffd700; }
        .ri-tier.diamond { color: #67e8f9; }
        .ri-tier.platinum{ color: #d946ef; }
        .rank-info-note {
            font-size: 0.8em; color: rgba(255,255,255,0.7);
            padding: 6px 20px 0; line-height: 1.5;
        }
        /* DRAW LEVEL POPUP */
        #draw-level-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65); z-index: 31000;
            align-items: center; justify-content: center;
        }
        #draw-level-overlay.active { display: flex; }
        .dl-modal {
            background: linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
            border: 1px solid rgba(255,255,255,0.18); border-radius: 18px;
            width: 500px; max-width: 94vw; padding: 0 0 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            animation: popIn .18s ease;
        }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .dl-header {
            background: rgba(255,255,255,0.1); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255,255,255,0.15);
            border-radius: 18px 18px 0 0; padding: 14px 18px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .dl-title { font-size: 1.05em; font-weight: bold; color: #fff; }
        .dl-level-badge {
            display: flex; align-items: center; justify-content: center;
            gap: 8px; padding: 14px 18px 8px;
        }
        .dl-level-star {
            font-size: 1.8em; filter: drop-shadow(0 0 8px #ffd700);
        }
        .dl-level-text { font-size: 1.3em; font-weight: bold; color: #ffd700; }
        .dl-progress-wrap { padding: 0 18px 12px; }
        .dl-progress-label {
            font-size: 0.8em; color: rgba(255,255,255,0.7); margin-bottom: 5px;
            display: flex; justify-content: space-between;
        }
        .dl-progress-bar-bg {
            background: rgba(255,255,255,0.12); border-radius: 20px; height: 10px; overflow: hidden;
        }
        .dl-progress-bar-fill {
            height: 100%; border-radius: 20px; transition: width .4s ease;
            background: linear-gradient(90deg, #f093fb, #f5576c);
        }
        .dl-section-title {
            font-size: 0.75em; font-weight: bold; color: rgba(255,255,255,0.6);
            text-transform: uppercase; letter-spacing: 0.06em;
            padding: 6px 18px 4px;
        }
        .dl-rate-grid {
            display: grid; grid-template-columns: 1fr;
            gap: 5px; padding: 0 18px;
        }
        .dl-rate-row {
            display: flex; justify-content: space-between; align-items: center;
            background: rgba(255,255,255,0.07); border-radius: 8px;
            padding: 5px 10px; font-size: 0.82em;
        }
        .dl-rate-name { color: rgba(255,255,255,0.85); flex: 1; }
        .dl-rate-pct  { font-weight: bold; color: #ffd700; min-width: 48px; text-align: right; }
        .dl-rate-stock { font-size: 0.78em; color: rgba(255,255,255,0.5); min-width: 90px; text-align: right; padding-left: 10px; }
        .btn-dl-info {
            background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
            color: #fff; border-radius: 8px; padding: 4px 7px;
            font-size: 1.1em; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: background .15s; flex-shrink: 0; line-height: 1;
        }
        .btn-dl-info:hover { background: rgba(255,255,255,0.28); }
        .profile-empty { color: rgba(255,255,255,0.5); text-align: center; padding: 40px 0; font-size: 1em; }
        /* Rank display in profile */
        .profile-rank-section {
            margin-top: 20px;
            padding-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.15);
        }
        .profile-rank-display {
            display: flex;
            gap: 20px;
            justify-content: flex-start;
            flex-wrap: wrap;
        }
        .profile-rank-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 16px;
            padding: 16px 20px;
            min-width: 130px;
            gap: 8px;
        }
        .profile-rank-label {
            font-size: 0.78em;
            color: rgba(255,255,255,0.6);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .profile-rank-img {
            width: 90px;
            height: 90px;
            object-fit: contain;
            border-radius: 10px;
            image-rendering: auto;
        }
        .profile-rank-name {
            font-size: 0.95em;
            font-weight: bold;
            color: #ffd700;
            text-align: center;
        }
        .profile-rank-points {
            font-size: 0.8em;
            color: rgba(255,255,255,0.65);
        }
        @media (max-width: 480px) {
            .profile-rank-img { width: 70px; height: 70px; }
            .profile-rank-item { min-width: 100px; padding: 12px 14px; }
        }

        /* ============================================ */
        /* FRIEND SYSTEM */
        /* ============================================ */
        .friend-search-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .friend-search-input {
            flex: 1; padding: 11px 14px;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 12px; color: #fff;
            font-size: 0.92em; outline: none;
        }
        .friend-search-input::placeholder { color: rgba(255,255,255,0.45); }
        .friend-search-input:focus { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.2); }
        .btn-friend-search {
            padding: 11px 18px; border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; border: none; cursor: pointer; font-weight: bold; font-size: 0.9em;
        }
        .btn-friend-search:hover { transform: translateY(-2px); }
        .friend-section-title {
            font-size: 0.95em; font-weight: bold; color: rgba(255,255,255,0.8);
            margin: 18px 0 10px; padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.18);
            display: flex; align-items: center; gap: 6px;
        }
        .friend-req-badge {
            background: rgba(244,67,54,0.85); border-radius: 50%;
            width: 20px; height: 20px; display: none;
            align-items: center; justify-content: center;
            font-size: 0.72em; font-weight: bold; color: #fff;
        }
        .friend-card {
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16);
            border-radius: 14px; padding: 12px 14px; margin-bottom: 8px;
            display: flex; align-items: center; gap: 12px;
        }
        .friend-avatar {
            width: 42px; height: 42px; background: rgba(255,255,255,0.2);
            border-radius: 50%; display: flex; align-items: center;
            justify-content: center; font-size: 1.3em; font-weight: bold; flex-shrink: 0;
        }
        .friend-info { flex: 1; min-width: 0; }
        .friend-name { font-weight: bold; font-size: 0.93em; color: #fff; }
        .friend-id { font-size: 0.76em; color: rgba(255,255,255,0.52); font-family: monospace; margin-top: 2px; }
        .friend-actions { display: flex; gap: 5px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .btn-fa {
            padding: 6px 11px; border-radius: 8px;
            font-size: 0.8em; font-weight: bold;
            border: none; cursor: pointer; transition: all 0.2s; color: #fff;
        }
        .btn-fa-add    { background: rgba(76,175,80,0.7); }
        .btn-fa-add:hover { background: rgba(76,175,80,1); transform: translateY(-1px); }
        .btn-fa-remove { background: rgba(244,67,54,0.55); }
        .btn-fa-remove:hover { background: rgba(244,67,54,0.85); }
        .btn-fa-accept { background: rgba(76,175,80,0.7); }
        .btn-fa-accept:hover { background: rgba(76,175,80,1); }
        .btn-fa-reject { background: rgba(244,67,54,0.5); }
        .btn-fa-reject:hover { background: rgba(244,67,54,0.85); }
        .btn-fa-view   { background: rgba(255,255,255,0.2); }
        .btn-fa-view:hover { background: rgba(255,255,255,0.35); }
        .btn-fa-visit  { background: rgba(33,150,243,0.75); }
        .btn-fa-visit:hover { background: rgba(33,150,243,1); transform: translateY(-1px); }
        .btn-fa-sent   { background: rgba(255,193,7,0.35); cursor: default; }
        .friend-pending { color: rgba(255,255,255,0.48); text-align: center; padding: 18px 0; font-size: 0.88em; }

        /* Modal Lihat Profil Pemain (tidak dipakai lagi, diganti halaman penuh) */
        #view-profile-modal { display: none; }

        /* Halaman Penuh: Kunjungi Profil Pemain */
        #visit-profile-screen {
            display: none; position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 20000; flex-direction: row;
        }
        #visit-profile-screen.active { display: flex; }
        #visit-profile-sidebar {
            width: 180px; flex-shrink: 0;
            background: rgba(0,0,0,0.25);
            border-right: 1px solid rgba(255,255,255,0.15);
            display: flex; flex-direction: column;
            padding: 20px 12px; gap: 10px;
        }
        .visit-tab {
            background: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.8);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px; padding: 14px 12px;
            font-size: 0.9em; font-weight: bold;
            text-align: left; cursor: pointer; transition: all 0.2s;
        }
        .visit-tab:hover { background: rgba(255,255,255,0.2); color: #fff; }
        .visit-tab.active {
            background: rgba(255,255,255,0.25); color: #fff;
            border-color: rgba(255,255,255,0.5);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        #btn-visit-back {
            position: absolute;
            top: 12px; right: 15px;
            width: 36px; height: 36px;
            background: rgba(244,67,54,0.85);
            color: #fff; border: 2px solid rgba(255,255,255,0.4);
            border-radius: 50%; font-size: 1.2em;
            font-weight: bold; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            z-index: 10; padding: 0; line-height: 1;
            box-shadow: 0 2px 8px rgba(244,67,54,0.4);
        }
        #btn-visit-back:hover { background: #f44336; transform: scale(1.1); box-shadow: 0 4px 14px rgba(244,67,54,0.6); }
        #visit-profile-content { flex: 1; overflow-y: auto; padding: 30px; }
        .visit-panel { display: none; }
        .visit-panel.active { display: block; }
        .visit-panel-title {
            font-size: 1.4em; font-weight: bold; color: #fff;
            margin-bottom: 24px; padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.25);
        }
        .vp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
        .vp-avatar {
            width: 60px; height: 60px; background: rgba(255,255,255,0.22);
            border-radius: 11px; display: flex; align-items: center;
            justify-content: center; font-size: 1.9em; font-weight: bold; flex-shrink: 0;
            overflow: hidden;
        }
        .vp-name { font-size: 1.3em; font-weight: bold; }
        .vp-uid  { font-size: 0.78em; color: rgba(255,255,255,0.58); font-family: monospace; }
        .vp-joined { font-size: 0.78em; color: rgba(255,255,255,0.5); margin-top: 2px; }
        .vp-stat {
            background: rgba(255,255,255,0.1); border-radius: 12px;
            padding: 11px 15px; margin-bottom: 7px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .vp-stat-label { color: rgba(255,255,255,0.72); font-size: 0.87em; }
        .vp-stat-value { font-weight: bold; font-size: 0.97em; }
        .btn-visit-friend {
            width: 100%; padding: 14px; border-radius: 12px; border: none;
            font-size: 0.95em; font-weight: bold; cursor: pointer;
            margin-top: 16px; transition: all 0.2s;
        }
        @media (max-width: 480px) {
            #visit-profile-screen { flex-direction: column; }
            #visit-profile-sidebar {
                width: auto; flex-direction: row; padding: 10px;
                border-right: none; border-bottom: 1px solid rgba(255,255,255,0.15);
                gap: 6px; overflow-x: auto;
            }
            .visit-tab { padding: 10px; font-size: 0.82em; white-space: nowrap; }
        }

        @media (max-width: 480px) {
            #profile-screen { flex-direction: column; }
            #profile-sidebar {
                width: auto; flex-direction: row; padding: 10px;
                border-right: none; border-bottom: 1px solid rgba(255,255,255,0.15);
                gap: 6px; overflow-x: auto;
            }
            .profile-tab { padding: 10px 10px; font-size: 0.82em; white-space: nowrap; }
        }

        /* ============================================ */
        /* SETTINGS SCREEN */
        /* ============================================ */
        .btn-settings {
            background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
            color: #fff; font-size: 1em; font-weight: bold;
            padding: 14px 32px; border-radius: 14px;
            margin-top: 12px; display: block;
            width: 100%; max-width: 280px; border: none;
            box-shadow: 0 6px 20px rgba(161,140,209,0.4);
            letter-spacing: 0.3px;
        }
        .btn-settings:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(161,140,209,0.6); }

        #settings-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 15000; flex-direction: column; align-items: center;
            overflow-y: auto;
        }
        .settings-header {
            width: 100%; background: rgba(0,0,0,0.25);
            border-bottom: 1px solid rgba(255,255,255,0.15);
            padding: 16px 20px; display: flex; align-items: center;
            justify-content: space-between; position: sticky; top: 0; z-index: 10;
            box-sizing: border-box;
        }
        .settings-title { font-size: 1.4em; font-weight: bold; color: #fff; }
        .btn-settings-close {
            background: rgba(244,67,54,0.85); color: #fff;
            border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;
            padding: 8px 18px; font-size: 0.9em; font-weight: bold; cursor: pointer;
        }
        .btn-settings-close:hover { background: #f44336; }

        /* ============================================ */
        /* PENGEMBANG SCREEN */
        /* ============================================ */
        .btn-pengembang-style {
            background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%) !important;
            box-shadow: 0 4px 14px rgba(0,114,255,0.45) !important;
            color: #fff !important;
        }
        #pengembang-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 15000; flex-direction: column; align-items: center;
            overflow-y: auto;
        }
        .pengembang-header {
            width: 100%; background: rgba(0,0,0,0.25);
            border-bottom: 1px solid rgba(255,255,255,0.15);
            padding: 16px 20px; display: flex; align-items: center;
            justify-content: space-between; position: sticky; top: 0; z-index: 10;
            box-sizing: border-box;
        }
        .pengembang-title { font-size: 1.4em; font-weight: bold; color: #fff; }
        .btn-pengembang-close {
            background: rgba(244,67,54,0.85); color: #fff;
            border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;
            padding: 8px 18px; font-size: 0.9em; font-weight: bold; cursor: pointer;
        }
        .btn-pengembang-close:hover { background: #f44336; }
        .pengembang-body {
            width: 100%; max-width: 520px; padding: 28px 20px;
            box-sizing: border-box; display: flex; flex-direction: column; gap: 18px;
        }
        .dev-panel {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 16px;
            padding: 20px;
            display: flex; flex-direction: column; align-items: center;
            gap: 12px;
            -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        }
        .dev-panel-role {
            font-size: 0.8em; font-weight: 700; letter-spacing: 1px;
            text-transform: uppercase; color: #ffd200;
            background: rgba(255,210,0,0.15); border-radius: 20px;
            padding: 3px 12px;
        }
        .dev-panel-photo {
            width: 110px; height: 110px;
            object-fit: cover;
            border-radius: 12px;
            border: 3px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.1);
        }
        .dev-panel-name {
            font-size: 1.05em; font-weight: bold; color: #fff;
            text-align: center;
        }
        .dev-panel-info {
            font-size: 0.85em; color: rgba(255,255,255,0.65);
            text-align: center; line-height: 1.5;
        }
        .settings-body {
            width: 100%; max-width: 480px; padding: 28px 20px;
            box-sizing: border-box;
        }
        .settings-section {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 16px; padding: 20px 22px;
            margin-bottom: 16px;
        }
        .settings-section-label {
            color: #fff; font-size: 1em;
            font-weight: bold; margin-bottom: 14px; display: block;
        }
        .settings-info-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 0;
        }
        .settings-info-label { color: rgba(255,255,255,0.65); font-size: 0.9em; }
        .settings-info-value { color: #fff; font-weight: bold; font-size: 0.9em; word-break: break-all; text-align: right; }
        .settings-slider-row { display: flex; align-items: center; gap: 14px; }
        .settings-slider {
            flex: 1; -webkit-appearance: none; appearance: none;
            height: 6px; border-radius: 3px;
            background: rgba(255,255,255,0.25); outline: none; cursor: pointer;
        }
        .settings-slider::-webkit-slider-thumb {
            -webkit-appearance: none; width: 20px; height: 20px;
            border-radius: 50%; background: #fff;
            cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .settings-slider-val {
            min-width: 38px; text-align: right; color: #fff;
            font-size: 0.9em; font-weight: bold; font-family: monospace;
        }
        .settings-divider {
            border: none; border-top: 1px solid rgba(255,255,255,0.15);
            margin: 8px 0 20px;
        }
        .btn-logout-settings {
            width: 100%; padding: 15px; border-radius: 14px;
            background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
            color: #fff; font-size: 1em; font-weight: bold;
            border: none; cursor: pointer;
            box-shadow: 0 4px 15px rgba(244,67,54,0.4);
        }
        .btn-logout-settings:hover { box-shadow: 0 8px 24px rgba(244,67,54,0.6); }

        /* ============================================ */
        /* PROVINCE TOOLTIP & SETTINGS TOGGLE           */
        /* ============================================ */
        #province-tooltip {
            position: fixed;
            background: rgba(10, 10, 25, 0.92);
            color: #fff;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 0.76em;
            font-weight: bold;
            pointer-events: none;
            z-index: 99999;
            white-space: nowrap;
            box-shadow: 0 3px 12px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.18);
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
            transition: opacity 0.12s ease;
        }
        #province-tooltip.visible { opacity: 1; }

        .settings-toggle-row {
            display: flex; justify-content: space-between;
            align-items: center; padding: 4px 0;
        }
        .settings-toggle-label { color: rgba(255,255,255,0.85); font-size: 0.92em; }
        .settings-toggle {
            position: relative; display: inline-block;
            width: 46px; height: 26px; flex-shrink: 0;
        }
        .settings-toggle input { opacity: 0; width: 0; height: 0; }
        .settings-toggle-slider {
            position: absolute; cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.2); border-radius: 26px;
            transition: 0.3s;
        }
        .settings-toggle-slider:before {
            position: absolute; content: '';
            height: 20px; width: 20px; left: 3px; bottom: 3px;
            background: white; border-radius: 50%; transition: 0.3s;
        }
        .settings-toggle input:checked + .settings-toggle-slider { background: #4caf50; }
        .settings-toggle input:checked + .settings-toggle-slider:before { transform: translateX(20px); }

        /* ============================================ */
        /* PARTY LOBBY POPUP                            */
        /* ============================================ */
        #party-lobby-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65); z-index: 20000;
            justify-content: center; align-items: center;
            -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
        .party-lobby-card {
            background: linear-gradient(135deg, rgba(102,126,234,0.97) 0%, rgba(118,75,162,0.97) 100%);
            border-radius: 22px;
            padding: 28px 24px 22px;
            width: min(390px, 92vw);
            box-shadow: 0 24px 64px rgba(0,0,0,0.55);
            border: 1px solid rgba(255,255,255,0.18);
            position: relative;
        }
        .party-lobby-title {
            color: #fff; font-size: 1.35em; font-weight: 800;
            text-align: center; margin: 0 0 22px; letter-spacing: 0.5px;
        }
        .party-slots {
            display: flex; align-items: stretch; gap: 10px;
            justify-content: center; margin-bottom: 14px;
        }
        .party-slot {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; gap: 7px; padding: 16px 8px 14px;
            border-radius: 16px; position: relative; transition: transform 0.15s, background 0.15s;
            min-width: 0;
        }
        .party-slot.filled {
            background: rgba(255,255,255,0.14);
            border: 2px solid rgba(255,255,255,0.28); cursor: default;
        }
        .party-slot.empty {
            background: rgba(255,255,255,0.07);
            border: 2px dashed rgba(255,255,255,0.32); cursor: pointer;
        }
        .party-slot.empty:hover { transform: scale(1.03); background: rgba(255,255,255,0.13); }
        .party-slot.waiting {
            background: rgba(255,193,7,0.13);
            border: 2px dashed rgba(255,193,7,0.5); cursor: default;
        }
        .party-slot.joined {
            background: rgba(76,175,80,0.18);
            border: 2px solid rgba(76,175,80,0.5); cursor: default;
        }
        .party-slot-icon { font-size: 2em; line-height: 1; }
        .party-slot-name {
            color: #fff; font-size: 0.8em; font-weight: 600;
            text-align: center; word-break: break-word; line-height: 1.3;
        }
        .party-slot-sub {
            color: rgba(255,255,255,0.6); font-size: 0.72em;
            text-align: center; margin-top: 2px;
        }
        .party-slot-clear {
            position: absolute; top: 7px; right: 7px;
            background: rgba(244,67,54,0.75); border: none; color: #fff;
            border-radius: 50%; width: 20px; height: 20px; font-size: 0.7em;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            padding: 0; line-height: 1; transition: background 0.15s;
        }
        .party-slot-clear:hover { background: rgba(244,67,54,1); }
        .party-vs-divider {
            color: rgba(255,255,255,0.4); font-weight: 800; font-size: 0.85em;
            flex-shrink: 0; align-self: center; letter-spacing: 1px;
        }
        /* Friend picker inside popup */
        #party-friend-picker {
            background: rgba(0,0,0,0.2); border-radius: 14px;
            padding: 12px; margin-bottom: 14px;
        }
        .party-picker-title {
            color: rgba(255,255,255,0.65); font-size: 0.78em;
            font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .party-friend-list {
            max-height: 190px; overflow-y: auto;
            display: flex; flex-direction: column; gap: 5px;
        }
        .party-friend-item {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 10px;
            background: rgba(255,255,255,0.1); cursor: pointer;
            border: 1px solid transparent; width: 100%; color: #fff;
            text-align: left; transition: background 0.15s, border-color 0.15s;
            font-family: inherit;
        }
        .party-friend-item:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.2); }
        .party-friend-avatar {
            width: 30px; height: 30px; border-radius: 50%;
            background: rgba(255,255,255,0.2); display: flex;
            align-items: center; justify-content: center;
            font-size: 0.95em; font-weight: 700; flex-shrink: 0;
        }
        .party-friend-name { font-size: 0.87em; font-weight: 600; }
        /* Action buttons */
        .party-lobby-actions { display: flex; gap: 10px; margin-top: 6px; }
        .party-btn-cancel {
            flex: 1; padding: 12px 8px; border-radius: 13px;
            border: 1px solid rgba(255,255,255,0.28);
            background: rgba(255,255,255,0.1); color: #fff;
            font-size: 0.92em; cursor: pointer; transition: background 0.15s;
            font-family: inherit; font-weight: 600;
        }
        .party-btn-cancel:hover { background: rgba(255,255,255,0.2); }
        .party-btn-start {
            flex: 2; padding: 12px 8px; border-radius: 13px; border: none;
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: #1a3a2a; font-size: 0.95em; font-weight: 800;
            cursor: pointer; box-shadow: 0 4px 18px rgba(67,233,123,0.35);
            transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
        }
        .party-btn-start:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(67,233,123,0.5); }
        /* Party invite popup */
        #party-invite-popup {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65); z-index: 21000;
            justify-content: center; align-items: center;
            -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
        .party-invite-msg {
            color: rgba(255,255,255,0.85); text-align: center;
            margin: 0 0 20px; font-size: 0.95em; line-height: 1.5;
        }

        /* Badge notifikasi permintaan teman di tombol Teman */
        .btn-teman-wrapper { position: relative; display: inline-block; }
        #teman-notif-badge {
            position: absolute; top: -6px; right: -6px;
            background: #f44336; color: #fff;
            font-size: 0.7em; font-weight: 800;
            min-width: 18px; height: 18px;
            border-radius: 9px; padding: 0 4px;
            display: none; align-items: center; justify-content: center;
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(244,67,54,0.5);
            pointer-events: none; line-height: 1;
            animation: badgePop 0.3s ease;
        }
        @keyframes badgePop {
            0%   { transform: scale(0); }
            70%  { transform: scale(1.25); }
            100% { transform: scale(1); }
        }

        /* ============================================ */
        /* KOSTUM / CUSTOM ROOM STYLES                  */
        /* ============================================ */
        .btn-kostum-style {
            background: linear-gradient(135deg, #a855f7, #7c3aed) !important;
            border-color: #7c3aed !important;
            color: #fff !important;
        }
        /* Role picker overlay */
        #kostum-picker-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.72); z-index: 22000;
            display: none; justify-content: center; align-items: center;
            -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
        }
        .kostum-picker-card {
            background: linear-gradient(160deg, #1a1040 0%, #0d1b2a 100%);
            border: 1px solid rgba(168,85,247,0.4);
            border-radius: 20px; padding: 32px 28px; width: 92%; max-width: 380px;
            text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.7);
        }
        .kostum-picker-title {
            font-size: 1.35em; font-weight: 700; color: #e2b3ff;
            margin-bottom: 6px;
        }
        .kostum-picker-sub {
            font-size: 0.82em; color: rgba(255,255,255,0.55);
            margin-bottom: 24px; line-height: 1.5;
        }
        .kostum-role-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .kostum-role-btn {
            flex: 1; min-width: 120px; padding: 16px 12px;
            border-radius: 14px; border: 2px solid transparent;
            cursor: pointer; font-size: 0.92em; font-weight: 700;
            transition: all 0.2s; font-family: inherit;
        }
        .kostum-role-btn.pemain {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
            color: #0d1b2a;
        }
        .kostum-role-btn.pemain:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(67,233,123,0.4); }
        .kostum-role-btn.penonton {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
        }
        .kostum-role-btn.penonton:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(118,75,162,0.5); }
        .kostum-role-btn .role-icon { font-size: 2em; display: block; margin-bottom: 6px; }
        .kostum-role-btn .role-label { display: block; font-size: 1.05em; }
        .kostum-role-btn .role-desc { display: block; font-size: 0.75em; opacity: 0.8; font-weight: 400; margin-top: 4px; }
        .btn-kostum-cancel {
            margin-top: 18px; background: transparent; color: rgba(255,255,255,0.5);
            border: none; cursor: pointer; font-size: 0.85em; font-family: inherit; padding: 4px;
        }
        /* Custom room lobby */
        #custom-room-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.72); z-index: 22000;
            display: none; justify-content: center; align-items: center;
            -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
        }
        .custom-room-card {
            background: linear-gradient(160deg, #1a1040 0%, #0d1b2a 100%);
            border: 1px solid rgba(168,85,247,0.4);
            border-radius: 20px; padding: 24px 20px; width: 94%; max-width: 420px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.7); max-height: 90vh; overflow-y: auto;
            position: relative;
        }
        .custom-room-title { font-size: 1.2em; font-weight: 700; color: #e2b3ff; text-align: center; margin-bottom: 4px; }
        .custom-room-subtitle { font-size: 0.78em; color: rgba(255,255,255,0.45); text-align: center; margin-bottom: 18px; }
        .custom-room-badge {
            display: inline-block; background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4);
            border-radius: 8px; padding: 6px 14px; font-size: 0.82em; color: #c084fc;
            text-align: center; margin: 0 auto 16px; display: block; letter-spacing: 0.5px;
        }
        .custom-slots { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .custom-slot {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 14px; border-radius: 12px;
            border: 1.5px dashed rgba(168,85,247,0.3);
            background: rgba(168,85,247,0.07); cursor: pointer;
            transition: all 0.2s; position: relative;
        }
        .custom-slot.filled {
            border-style: solid; border-color: rgba(168,85,247,0.5);
            background: rgba(168,85,247,0.15); cursor: default;
        }
        .custom-slot.self {
            border-color: rgba(67,233,123,0.5); background: rgba(67,233,123,0.1); cursor: default;
        }
        .custom-slot.spectator-slot {
            border-color: rgba(102,126,234,0.5); background: rgba(102,126,234,0.1); cursor: default;
        }
        .custom-slot:not(.filled):not(.self):not(.spectator-slot):hover {
            border-color: rgba(168,85,247,0.6); background: rgba(168,85,247,0.15);
        }
        .custom-slot-num {
            width: 28px; height: 28px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85em; font-weight: 700; flex-shrink: 0;
            background: rgba(168,85,247,0.25); color: #c084fc;
        }
        .custom-slot.self .custom-slot-num { background: rgba(67,233,123,0.25); color: #43e97b; }
        .custom-slot.bot-slot {
            border-style: solid; border-color: rgba(251,191,36,0.4);
            background: rgba(251,191,36,0.08); cursor: default;
        }
        .custom-slot.bot-slot .custom-slot-num { background: rgba(251,191,36,0.2); color: #fbbf24; }
        .custom-slot-name { font-size: 0.9em; color: rgba(255,255,255,0.85); flex: 1; }
        .custom-slot-empty-text { font-size: 0.82em; color: rgba(255,255,255,0.38); flex: 1; }
        .bot-section-title { font-size: 0.75em; color: rgba(251,191,36,0.7); margin: 6px 0 4px; letter-spacing: 0.5px; }
        .bot-add-btns { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .btn-add-bot {
            font-size: 0.76em; padding: 5px 11px; border-radius: 8px; cursor: pointer;
            border: 1.5px solid rgba(251,191,36,0.4); background: rgba(251,191,36,0.1);
            color: #fbbf24; font-family: inherit; transition: all 0.15s;
        }
        .btn-add-bot:hover { background: rgba(251,191,36,0.22); border-color: rgba(251,191,36,0.7); }
        .btn-add-bot:disabled { opacity: 0.4; cursor: not-allowed; }
        .custom-slot-tag { font-size: 0.68em; padding: 2px 7px; border-radius: 6px; color: #43e97b; background: rgba(67,233,123,0.15); }
        .custom-slot-clear {
            background: rgba(244,67,54,0.2); border: 1px solid rgba(244,67,54,0.4);
            color: #f44336; border-radius: 6px; padding: 2px 7px;
            cursor: pointer; font-size: 0.75em; font-family: inherit;
        }
        .custom-friend-picker {
            background: rgba(0,0,0,0.3); border-radius: 12px;
            padding: 10px; margin-bottom: 14px; max-height: 180px; overflow-y: auto;
        }
        .custom-friend-picker-title { font-size: 0.78em; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
        .custom-friend-item {
            display: flex; align-items: center; gap: 10px;
            padding: 8px 10px; border-radius: 9px; cursor: pointer;
            transition: background 0.15s;
        }
        .custom-friend-item:hover { background: rgba(168,85,247,0.2); }
        .custom-friend-dot { width: 8px; height: 8px; border-radius: 50%; background: #43e97b; flex-shrink: 0; }
        .custom-friend-name { font-size: 0.87em; color: rgba(255,255,255,0.88); flex: 1; }
        .custom-friend-btn {
            font-size: 0.75em; padding: 3px 9px; border-radius: 7px;
            border: 1px solid rgba(168,85,247,0.5); background: rgba(168,85,247,0.2);
            color: #c084fc; cursor: pointer; font-family: inherit;
        }
        .custom-room-actions { display: flex; gap: 10px; }
        .btn-custom-cancel {
            flex: 0 0 auto; padding: 11px 16px; border-radius: 12px;
            border: 1.5px solid rgba(244,67,54,0.4); background: rgba(244,67,54,0.1);
            color: rgba(255,100,100,0.9); cursor: pointer; font-family: inherit; font-size: 0.9em;
        }
        .btn-custom-start {
            flex: 1; padding: 12px; border-radius: 12px; border: none;
            background: linear-gradient(135deg, #a855f7, #7c3aed);
            color: #fff; font-weight: 700; font-size: 1em;
            cursor: pointer; font-family: inherit;
            transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-custom-start:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }
        /* Custom room invite popup */
        #custom-room-invite-popup {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65); z-index: 23000;
            display: none; justify-content: center; align-items: center;
            -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
        /* Spectator banner in game */
        #spectator-banner {
            display: none; position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9));
            color: #fff; font-size: 0.82em; font-weight: 700; padding: 6px 18px;
            border-radius: 20px; z-index: 5000; letter-spacing: 0.5px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4); pointer-events: none;
        }

        /* ============================================ */
        /* MOBILE RESPONSIVE                            */
        /* ============================================ */
        @media (max-width: 768px) {
            body { overflow-y: auto; }

            /* Matchmaking */
            .matchmaking-waiting-box { padding: 24px 20px; border-radius: 18px; width: 92%; }
            .matchmaking-title { font-size: 1.8em; }
            .matchmaking-waiting-title { font-size: 1.3em; }

            /* Game layout: stack opponents above game area */
            .game-container { padding: 6px; }
            .main-content { grid-template-columns: 1fr; gap: 8px; }

            /* Opponents panel: horizontal scrolling strip */
            .opponents-panel {
                display: flex; flex-direction: row;
                overflow-x: auto; overflow-y: hidden;
                max-height: none; height: auto;
                padding: 8px; gap: 8px; width: 100%;
            }
            .opponents-title { display: none; }
            .opponent-item { min-width: 130px; flex-shrink: 0; margin-bottom: 0; }
            .opponent-stats { flex-direction: column; gap: 3px; }

            /* Cards */
            .card {
                width: 88px; height: 124px;
                min-width: 88px; max-width: 88px;
                min-height: 124px; max-height: 124px;
            }
            .card-image { height: 44px; }
            .card-name { font-size: 0.68em; }

            /* Top card area */
            .top-card-area { min-height: 180px; height: auto; padding: 10px; }

            /* Player area */
            .player-deck-container { max-height: 200px; }
            .player-stats { font-size: 0.88em; gap: 6px; }
            .player-stat { padding: 4px 8px; }

            /* In-game settings panel */
            #ingame-settings-panel { width: calc(100vw - 28px); left: 14px; }

            /* Party lobby */
            .party-slot { padding: 12px 4px 10px; }
            .party-slot-icon { font-size: 1.5em; }
            .party-slot-name { font-size: 0.72em; }

            /* Province preview */
            #provinces-preview { padding: 18px 14px; }
            .prov-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
            .prov-chip-icon { width: 48px; height: 34px; }
            .prov-chip { font-size: 0.8em; }

            /* Log */
            .log-area { max-height: 80px; }
        }

        @media (max-width: 480px) {
            .matchmaking-waiting-box { padding: 18px 14px; width: 96%; }
            .matchmaking-title { font-size: 1.4em; }

            .card {
                width: 76px; height: 108px;
                min-width: 76px; max-width: 76px;
                min-height: 108px; max-height: 108px;
            }
            .card-image { height: 36px; }
            .card-name { font-size: 0.6em; }
            .card-type { font-size: 0.55em; }

            .player-stat { padding: 3px 6px; font-size: 0.78em; }

            /* Party slots wrap on very small screens */
            .party-slots { flex-wrap: wrap; }
            .party-slot { min-width: calc(50% - 8px); }

            .prov-chip { font-size: 0.7em; padding: 4px 6px; }
            .prov-chip-icon { width: 28px; height: 20px; }

            /* In-game settings panel full width */
            #ingame-settings-panel { width: calc(100vw - 14px); left: 7px; }
        }

        /* Lobby minimize button */
        .lobby-minimize-btn {
            position: absolute; top: 12px; right: 14px;
            background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.3);
            color: #fff; border-radius: 8px; width: 30px; height: 30px;
            cursor: pointer; font-size: 1.1em; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s; padding: 0; line-height: 1; z-index: 2;
        }
        .lobby-minimize-btn:hover { background: rgba(255,255,255,0.3); transform: none; box-shadow: none; }
        /* Lobby floating bubble (shown when minimized) */
        .lobby-bubble {
            position: fixed; bottom: 80px; right: 18px;
            background: linear-gradient(135deg, rgba(20,10,60,0.97), rgba(60,20,120,0.97));
            border: 1.5px solid rgba(255,255,255,0.25);
            border-radius: 50px; padding: 10px 16px 10px 12px;
            display: none; align-items: center; gap: 9px;
            z-index: 21500; cursor: pointer;
            box-shadow: 0 6px 24px rgba(0,0,0,0.5);
            max-width: 230px; animation: bubbleIn 0.25s ease;
        }
        /* FLOATING MATCHMAKING BAR */
        #matchmaking-float-bar {
            position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(20,10,60,0.97), rgba(60,20,120,0.97));
            border: 1.5px solid rgba(255,255,255,0.25);
            border-radius: 50px; padding: 8px 14px 8px 14px;
            align-items: center; gap: 10px;
            z-index: 99999;
            box-shadow: 0 6px 24px rgba(0,0,0,0.5);
            animation: floatBarIn 0.3s ease;
            white-space: nowrap;
        }
        @keyframes floatBarIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .mf-icon { font-size: 1.1em; }
        .mf-info { display: flex; flex-direction: column; gap: 1px; }
        .mf-label { font-size: 0.82em; font-weight: 700; color: #fff; }
        .mf-timer { font-size: 0.75em; color: rgba(255,255,255,0.7); font-variant-numeric: tabular-nums; }
        .mf-cancel-btn {
            background: rgba(255,80,80,0.25); border: 1px solid rgba(255,80,80,0.5);
            color: #fff; border-radius: 50%; width: 26px; height: 26px;
            cursor: pointer; font-size: 0.8em; display: flex; align-items: center;
            justify-content: center; transition: background 0.2s;
            flex-shrink: 0;
        }
        .mf-cancel-btn:hover { background: rgba(255,80,80,0.5); }

        @keyframes bubbleIn {
            from { opacity: 0; transform: translateY(16px) scale(0.92); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lobby-bubble-icon { font-size: 1.3em; flex-shrink: 0; }
        .lobby-bubble-info { display: flex; flex-direction: column; gap: 1px; }
        .lobby-bubble-label { font-size: 0.82em; font-weight: 700; color: #fff; white-space: nowrap; }
        .lobby-bubble-sub   { font-size: 0.7em; color: rgba(255,255,255,0.6); white-space: nowrap; }
        .lobby-bubble-dot   { width: 7px; height: 7px; border-radius: 50%; background: #ffd700;
                              flex-shrink: 0; margin-left: auto; animation: pulseDot 1s infinite; }
        @keyframes pulseDot {
            0%,100% { opacity: 1; transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(0.7); }
        }
    </style>
    <link rel="preload" as="image" href="gambar/background/bg1.png">
</head>
<body>

    <!-- TAMBAH di paling awal <body> -->
    <div id="firebase-loading" style="
        position:fixed; top:0; left:0; width:100%; height:100%;
        background: url('gambar/background/bg1.png') no-repeat center center;
        background-size: 100% 100%;
        display:flex; justify-content:center; align-items:center;
        z-index: 99999; flex-direction:column; gap:20px;">
        <div style="font-size:2.5em; font-weight:bold; text-shadow:0 2px 10px rgba(0,0,0,0.7);"></div>
        <div style="width:60px;height:60px;border:6px solid rgba(255,255,255,0.3);
                    border-top:6px solid #fff;border-radius:50%;
                    animation:spin 1s linear infinite;"></div>
        <div style="font-size:1em;opacity:0.9;text-shadow:0 1px 6px rgba(0,0,0,0.7);">Memuat...</div>
    </div>


    <!-- TAMBAH di awal <body>, SEBELUM pre-loading screen (HTML) -->

    <!-- PROFILE BADGE (pojok kanan atas) -->
    <!-- AUTO MODE INDICATOR -->
    <div id="auto-mode-indicator">🤖 Mode Otomatis Aktif</div>

    <!-- AUTH SCREEN -->
    <div id="auth-screen" style="display:none;">
        <img class="campus-logo" src="gambar/logo/Unmuh babel.png" alt="Logo Kampus">
        <div class="auth-container">
            <h1 class="auth-title">👤Account👤<br></h1>
            <div class="auth-tabs">
                <button class="auth-tab active" onclick="playSound('button');switchAuthTab('login')">🔐 Login</button>
                <button class="auth-tab" onclick="playSound('button');switchAuthTab('register')">📝 Daftar</button>
            </div>
            <div id="auth-error" class="auth-error"></div>
            
            <!-- Login Form -->
            <div id="login-form">
                <input type="email" class="auth-input" id="login-email" placeholder="📧 Email" autocomplete="email">
                <input type="password" class="auth-input" id="login-password" placeholder="🔑 Password" autocomplete="current-password">
                <button class="btn-auth" onclick="playSound('button');doLogin()">🚀 Masuk</button>
            </div>
            
            <!-- Register Form -->
            <div id="register-form" style="display:none;">
                <div style="background:rgba(255,193,7,0.2);border:1px solid rgba(255,193,7,0.5);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:0.85em;text-align:left;line-height:1.6;">
                    ℹ️ Gunakan username bebas, lalu tambahkan <strong>&#64;cardgame.local</strong> di belakangnya.<br>
                    Contoh: <em>muridbaik&#64;cardgame.local</em>
                </div>
                <input type="text" class="auth-input" id="reg-email" placeholder="📧 Email (@cardgame.local)" autocomplete="off">
                <input type="password" class="auth-input" id="reg-password" placeholder="🔑 Password (min 6 karakter)">
                <input type="password" class="auth-input" id="reg-confirm" placeholder="🔑 Konfirmasi Password">
                <button class="btn-auth" onclick="playSound('button');doRegister()">✨ Buat Akun</button>
            </div>
            
            <div class="auth-loading" id="auth-loading">⏳ Memproses...</div>
        </div>
    </div>

    <!-- NICKNAME SCREEN -->
    <div id="nickname-screen">
        <div class="nickname-container">
            <h1 class="nickname-title">✍️ Pilih Nickname</h1>
            <p class="nickname-subtitle">Nickname akan ditampilkan kepada pemain lain</p>
            <div class="nickname-rule">
                ✅ 3–20 karakter<br>
                ✅ Huruf, angka, spasi, underscore<br>
                ❌ Tidak boleh mengandung kata kasar
            </div>
            <div id="nickname-error" class="auth-error"></div>
            <input type="text" class="auth-input" id="nickname-input" 
                   placeholder="🎮 Nickname kamu..." maxlength="20"
                   oninput="previewNickname(this.value)">
            <div style="margin-bottom:15px; font-size:0.9em; opacity:0.7;">
                Preview: <strong id="nickname-preview">...</strong>
            </div>
            <button class="btn-auth" onclick="playSound('button');saveNickname()">✅ Simpan & Lanjutkan</button>
        </div>
    </div>

    <!-- AVATAR SETUP SCREEN -->
    <div id="avatar-setup-screen">
        <div class="avatar-setup-container">
            <h1 class="nickname-title">🖼️ Pilih Foto Profil</h1>
            <p class="nickname-subtitle">Pilih avatar yang mewakili kamu!</p>
            <div class="avatar-setup-preview">
                <img id="avs-preview-img" src="gambar/avatar/avatar1.png?v=1.0" alt="Preview">
            </div>
            <div class="avatar-grid">
                <div class="avatar-option" id="avs-opt-0" onclick="playSound('button');selectAvatarSetup(0)"><img src="gambar/avatar/avatar1.png?v=1.0" alt="Avatar 1" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-1" onclick="playSound('button');selectAvatarSetup(1)"><img src="gambar/avatar/avatar2.png?v=1.0" alt="Avatar 2" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-2" onclick="playSound('button');selectAvatarSetup(2)"><img src="gambar/avatar/avatar3.png?v=1.0" alt="Avatar 3" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-3" onclick="playSound('button');selectAvatarSetup(3)"><img src="gambar/avatar/avatar4.png?v=1.0" alt="Avatar 4" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-4" onclick="playSound('button');selectAvatarSetup(4)"><img src="gambar/avatar/avatar5.png?v=1.0" alt="Avatar 5" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-5" onclick="playSound('button');selectAvatarSetup(5)"><img src="gambar/avatar/avatar6.png?v=1.0" alt="Avatar 6" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-6" onclick="playSound('button');selectAvatarSetup(6)"><img src="gambar/avatar/avatar7.png?v=1.0" alt="Avatar 7" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-7" onclick="playSound('button');selectAvatarSetup(7)"><img src="gambar/avatar/avatar8.png?v=1.0" alt="Avatar 8" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="avs-opt-8" onclick="playSound('button');selectAvatarSetup(8)"><img src="gambar/avatar/avatar9.png?v=1.0" alt="Avatar 9" onerror="this.parentElement.textContent='👤'"></div>
            </div>
            <button class="btn-auth" onclick="playSound('button');saveAvatarSetup()" style="margin-top:10px;">✅ Pilih & Mulai</button>
        </div>
    </div>

    <!-- PRE-LOADING SCREEN -->
    <div id="pre-loading-screen" style="display:none;">
        <img class="campus-logo" src="gambar/logo/Unmuh babel.png" alt="Logo Kampus">
        <div class="pre-loading-content">
            <h1 class="pre-loading-title"></h1>
            <p class="pre-loading-subtitle">Kenali budaya Indonesia melalui permainan kartu!</p>
            <div class="pre-loading-spinner" id="pre-loading-spinner"></div>
            <p class="pre-loading-info" id="pre-loading-info">Memuat aset...</p>
            <button class="btn-play" id="btn-play" onclick="playSound('button');goToMatchmaking()">▶ PLAY</button>
        </div>
    </div>

    <!-- PROFILE BADGE (standalone, hanya muncul di halaman matchmaking) -->
    <div id="profile-badge" title="Klik untuk logout">
        <div class="profile-badge-inner">
            <div class="profile-avatar" id="profile-avatar">👤</div>
            <div class="profile-info">
                <div class="profile-nickname" id="profile-nickname-display">-</div>
                <div class="profile-id" id="profile-id-display">-</div>
            </div>
            <div class="profile-status"></div>
        </div>
    </div>

    <!-- MATCHMAKING SCREEN -->
    <div id="matchmaking-screen">
        <img class="campus-logo" src="gambar/logo/Unmuh babel.png" alt="Logo Kampus">
        <div class="matchmaking-container">
            <div id="matchmaking-idle" style="display:flex;flex-direction:column;align-items:center;width:100%;">
                <button class="btn-start" onclick="playSound('button');showPartyLobby()">🎮 RANKED</button>
                <div class="menu-bottom-nav">
                    <button class="menu-nav-arrow" onclick="playSound('button');scrollMenuNav(-1)">◀</button>
                    <div class="menu-nav-scroll" id="menu-nav-scroll">
                        <div class="menu-nav-scroll-inner" id="menu-nav-inner">
                            <button class="btn-encyclopedia btn-leaderboard" onclick="playSound('button');showLeaderboard()">🏆 Leaderboard</button>
                            <button class="btn-encyclopedia btn-ensiklopedia-style" onclick="playSound('button');showEncyclopedia()">🧭 Ensiklopedia</button>
                            <div class="btn-teman-wrapper">
                                <button class="btn-encyclopedia btn-teman-style" onclick="playSound('button');showTemanScreen()">👥 Teman</button>
                                <div id="teman-notif-badge"></div>
                            </div>
                            <button class="btn-encyclopedia btn-kostum-style" onclick="playSound('button');showKostumPicker()">⚔️ Kostum</button>
                            <button class="btn-encyclopedia btn-settings-style" onclick="playSound('button');showSettingsScreen()">⚙️ Pengaturan</button>
                            <button class="btn-encyclopedia btn-pengembang-style" onclick="playSound('button');showPengembangScreen()">👨‍💻 Pengembang</button>
                        </div>
                    </div>
                    <button class="menu-nav-arrow" onclick="playSound('button');scrollMenuNav(1)">▶</button>
                </div>
            </div>

            <div id="matchmaking-waiting" style="display:none;flex-direction:column;align-items:center;width:100%;padding-bottom:40px;">
                <div class="matchmaking-waiting-box">
                    <div class="matchmaking-spinner"></div>
                    <h2 class="matchmaking-waiting-title">🔍 Mencari Lawan...</h2>
                    <p class="matchmaking-status" id="queue-status">Menunggu pemain lain...</p>
                    <p class="matchmaking-bot-countdown" id="matchmaking-bot-countdown" style="display:none;"></p>
                    <button class="btn-cancel" onclick="playSound('x');cancelMatchmaking()">✖ Batal</button>
                </div>
            </div>

            <div id="match-starting" style="display:none;">
                <div id="provinces-preview">
                    <div class="prov-preview-title">✅ Lawan Ditemukan!</div>
                    <div class="prov-preview-subtitle">Provinsi yang akan dimainkan di match ini:</div>
                    <div class="prov-grid" id="prov-grid"></div>
                    <div class="prov-countdown">Game dimulai dalam <span id="prov-countdown-num">6</span> detik...</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ENCYCLOPEDIA SCREEN -->
    <div id="encyclopedia-screen">
        <div class="enc-header">
            <div class="enc-title">🧭 Ensiklopedia Nusantara</div>
            <button class="btn-enc-close" onclick="playSound('x');hideEncyclopedia()">✖ Tutup</button>
        </div>

        <div class="enc-tabs">
            <button class="enc-tab active" id="enc-tab-btn-cards" onclick="playSound('button');showEncTab('cards')">🔶 Kartu</button>
            <button class="enc-tab" id="enc-tab-btn-rules" onclick="playSound('button');showEncTab('rules')">📖 Aturan</button>
        </div>

        <!-- TAB KARTU -->
        <div class="enc-tab-content active" id="enc-tab-cards">
            <div class="enc-province-filter" id="enc-prov-filter"></div>
            <div id="enc-cards-container"></div>
        </div>

        <!-- TAB ATURAN -->
        <div class="enc-tab-content" id="enc-tab-rules">
            <div class="enc-rules-container">
                <div class="enc-rules-title">📖 Cara Main Card Game Nusantara</div>
                <div class="enc-rules-subtitle">Mudah dipahami, seru dimainkan! 🎉</div>

                <div class="enc-rule-card" style="border-color:#667eea;">
                    <span class="enc-rule-icon">🎯</span>
                    <div class="enc-rule-heading">Tujuan Permainan</div>
                    <div class="enc-rule-text">
                        Tujuannya sederhana — <strong>habiskan kartumu secepat mungkin!</strong> Pemain yang <strong>kartunya paling cepat habis</strong> akan jadi pemenang. Setiap ronde, kamu bermain kartu dari tanganmu, jadi semakin banyak kartu yang kamu mainkan, semakin dekat kamu ke kemenangan!
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#f093fb;">
                    <span class="enc-rule-icon">🔶</span>
                    <div class="enc-rule-heading">Jenis Kartu & Kekuatannya</div>
                    <div class="enc-rule-text">Setiap provinsi punya 10 kartu dengan kekuatan berbeda:</div>
                    <div class="enc-rarity-row">
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#fff3e0,#ffcc80);color:#bf360c;">👑 SDA Unggulan — Power 10</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#fff9c4,#fff59d);color:#5d4037;">🔥 Bangunan Bersejarah — Power 9</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#818cf8,#4338ca);color:#fff;">💎 Sektor Ekonomi — Power 7</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#e1bee7,#ce93d8);color:#4a148c;">👾 Rumah Adat — Power 8</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#bbdefb,#64b5f6);color:#0d47a1;">💙 Senjata Tradisional — Power 6</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#e0f7fa,#80deea);color:#006064;">💠 Pakaian Adat — Power 5</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#c8e6c9,#81c784);color:#1b5e20;">💚 Alat Musik — Power 4</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#dcedc8,#aed581);color:#33691e;">🍀 Tarian — Power 3</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#f1f8e9,#c5e1a5);color:#33691e;">🟢 Adat Istiadat — Power 2</span>
                        <span class="enc-rarity-chip" style="background:linear-gradient(135deg,#f5f5f5,#e0e0e0);color:#424242;">⚪ Makanan Khas — Power 1</span>
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#f5576c;">
                    <span class="enc-rule-icon">⚔️</span>
                    <div class="enc-rule-heading">Tahap 1 — Siapa yang Jatuhkan Kartu Pertama?</div>
                    <div class="enc-rule-text">
                        Di setiap ronde, hanya <strong>1 pemain</strong> yang boleh jatuhkan kartu di Tahap 1. Kartu itu menentukan <strong>provinsi</strong> yang harus diikuti semua pemain lain.<br><br>
                        🔵 <strong>Ronde pertama:</strong> Komputer yang jatuhkan kartu pertama secara otomatis.<br>
                        🔴 <strong>Ronde berikutnya:</strong> Pemain yang memiliki <strong>kartu power tertinggi</strong> di ronde sebelumnya yang mendapat giliran jatuhkan kartu pertama!
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#38ef7d;">
                    <span class="enc-rule-icon">🔄</span>
                    <div class="enc-rule-heading">Tahap 2 — Giliran Semua Pemain Lain</div>
                    <div class="enc-rule-text">
                        Setelah Tahap 1, semua pemain <strong>selain yang sudah jatuhkan kartu di Tahap 1</strong> harus ikut bermain dengan kartu dari <strong>provinsi yang sama</strong>.<br><br>
                        ✅ <strong>Punya kartu provinsinya?</strong> Langsung jatuhkan!<br>
                        🟡 <strong>Tidak punya, tapi Kartu Tersisa masih ada?</strong> Lakukan <strong>Draw Card</strong> dulu.<br>
                        🔴 <strong>Tidak punya dan Kartu Tersisa sudah habis?</strong> Masuk mode <strong>Ambil Kartu</strong> dari meja!
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#ffd700;">
                    <span class="enc-rule-icon">⚡</span>
                    <div class="enc-rule-heading">Ambil Kartu dari Meja — Kapan & Siapa yang Bebas?</div>
                    <div class="enc-rule-text">
                        Mode <strong>Ambil Kartu</strong> terjadi saat kamu tidak punya kartu provinsi yang dimainkan dan tumpukan sudah habis. Kamu harus ambil salah satu kartu yang ada di meja.<br><br>
                        🎉 <strong>Tapi ada kondisi BEBAS!</strong> Kamu bisa bebas dari kewajiban ambil kartu jika:<br>
                        Jumlah pemain yang berhasil jatuhkan kartu di ronde ini <strong>lebih sedikit</strong> dari jumlah pemain yang kena mode Ambil Kartu.<br><br>
                        Contoh: 3 pemain kena Ambil Kartu, tapi hanya 1 pemain yang berhasil jatuhkan kartu → <strong>2 pemain dibebaskan!</strong><br><br>
                        Yang dibebaskan adalah pemain dengan <strong>kartu paling banyak di tangan</strong> — supaya permainan tetap adil! 😊
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#ff9800;">
                    <span class="enc-rule-icon">🏆</span>
                    <div class="enc-rule-heading">Pemenang Ronde & Juara Akhir</div>
                    <div class="enc-rule-text">
                        Di setiap ronde, <strong>kartu dengan power tertinggi</strong> menentukan siapa yang mulai ronde berikutnya. Tapi pemenang game bukan yang menang ronde terbanyak — melainkan <strong>siapa yang paling cepat menghabiskan semua kartunya! 🥇</strong> Urutan juara ditentukan dari siapa yang kartunya habis lebih dulu.
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#f093fb;">
                    <span class="enc-rule-icon">🎰</span>
                    <div class="enc-rule-heading">Sistem Draw Level — Makin Sering Draw, Makin Bagus Kartunya!</div>
                    <div class="enc-rule-text">
                        Setiap pemain punya <strong>Draw Level</strong> (Level 1–10) yang naik otomatis setiap <strong>1 kali Draw Card</strong>. Semakin tinggi levelmu, semakin besar peluang mendapat kartu langka! Level 10 adalah level tertinggi — 👑 Mythic dominan!<br><br>
                        <strong>🎴 Prioritas Kartu per Level (Lv1–Lv5):</strong>
                    </div>
                    <div style="overflow-x:auto; margin-top:8px;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.78em; text-align:center;">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.12);">
                                    <th style="padding:5px 4px; text-align:left; border-radius:6px 0 0 0;">Kartu</th>
                                    <th style="padding:5px 3px;">⭐ Lv1</th>
                                    <th style="padding:5px 3px;">⭐ Lv2</th>
                                    <th style="padding:5px 3px;">⭐ Lv3</th>
                                    <th style="padding:5px 3px;">⭐ Lv4</th>
                                    <th style="padding:5px 3px; border-radius:0 6px 0 0;">⭐ Lv5</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="text-align:left;padding:4px;">👑 Mythic</td><td>1%</td><td>1%</td><td>1%</td><td>1%</td><td>1%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">🔥 Legendary</td><td>4%</td><td>2%</td><td>2%</td><td>2%</td><td>1%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">👾 Epic</td><td>6%</td><td>4%</td><td>4%</td><td>5%</td><td>8%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">💎 Rare+</td><td>8%</td><td>7%</td><td>8%</td><td>9%</td><td>11%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">💙 Rare★</td><td>9%</td><td>10%</td><td>11%</td><td>12%</td><td>13%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">💠 Rare</td><td>10%</td><td>11%</td><td>12%</td><td>13%</td><td style="color:#ffd700;font-weight:bold;">18%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">💚 Uncommon</td><td>11%</td><td>13%</td><td>14%</td><td style="color:#ffd700;font-weight:bold;">19%</td><td>14%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">🍀 Uncommon+</td><td>13%</td><td>15%</td><td style="color:#ffd700;font-weight:bold;">20%</td><td>15%</td><td>13%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">🟢 Common+</td><td>16%</td><td style="color:#ffd700;font-weight:bold;">21%</td><td>15%</td><td>13%</td><td>11%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">⚪ Common</td><td style="color:#ffd700;font-weight:bold;">22%</td><td>16%</td><td>13%</td><td>11%</td><td>10%</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="enc-rule-text" style="margin-top:10px;">
                        <strong>🎴 Prioritas Kartu per Level (Lv6–Lv10):</strong>
                    </div>
                    <div style="overflow-x:auto; margin-top:8px;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.78em; text-align:center;">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.12);">
                                    <th style="padding:5px 4px; text-align:left; border-radius:6px 0 0 0;">Kartu</th>
                                    <th style="padding:5px 3px;">⭐ Lv6</th>
                                    <th style="padding:5px 3px;">⭐ Lv7</th>
                                    <th style="padding:5px 3px;">⭐ Lv8</th>
                                    <th style="padding:5px 3px;">⭐ Lv9</th>
                                    <th style="padding:5px 3px; border-radius:0 6px 0 0;">⭐ Lv10</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="text-align:left;padding:4px;">👑 Mythic</td><td>1%</td><td>2%</td><td>2%</td><td>8%</td><td style="color:#ffd700;font-weight:bold;">20%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">🔥 Legendary</td><td>4%</td><td>5%</td><td>11%</td><td style="color:#ffd700;font-weight:bold;">14%</td><td>17%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">👾 Epic</td><td>9%</td><td>12%</td><td style="color:#ffd700;font-weight:bold;">15%</td><td>14%</td><td>14%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">💎 Rare+</td><td>12%</td><td style="color:#ffd700;font-weight:bold;">16%</td><td>14%</td><td>13%</td><td>11%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">💙 Rare★</td><td style="color:#ffd700;font-weight:bold;">17%</td><td>14%</td><td>13%</td><td>11%</td><td>10%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">💠 Rare</td><td>14%</td><td>13%</td><td>11%</td><td>10%</td><td>9%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">💚 Uncommon</td><td>13%</td><td>11%</td><td>10%</td><td>9%</td><td>7%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">🍀 Uncommon+</td><td>11%</td><td>10%</td><td>9%</td><td>8%</td><td>6%</td></tr>
                                <tr><td style="text-align:left;padding:4px;">🟢 Common+</td><td>10%</td><td>9%</td><td>8%</td><td>7%</td><td>4%</td></tr>
                                <tr style="background:rgba(255,255,255,0.05);"><td style="text-align:left;padding:4px;">⚪ Common</td><td>9%</td><td>8%</td><td>7%</td><td>6%</td><td>2%</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="enc-rule-text" style="margin-top:10px;">
                        💡 <strong>Perlu diingat:</strong> Prioritas ini menentukan kartu mana yang dipilih lebih dulu dari tumpukan — jika kartu dari rarity tersebut sudah tidak tersisa, sistem otomatis beralih ke rarity berikutnya. Klik tombol <strong>ℹ️</strong> di sebelah Draw Card untuk cek level & progress-mu saat ini!
                    </div>
                </div>

                <div class="enc-rule-card" style="border-color:#4dd0e1;">
                    <span class="enc-rule-icon">💡</span>
                    <div class="enc-rule-heading">Tips Jago Main!</div>
                    <div class="enc-rule-text">
                        ✅ <strong>Utamakan buang kartu power kecil di awal game</strong> — simpan kartu power besar untuk late game!<br>
                        ✅ Di late game, kartu power besar memberi keunggulan ganda: lebih sering jadi yang mulai ronde <em>dan</em> kartumu lebih cepat habis.<br>
                        ✅ Kalau Ambil Kartu dari meja, pilih kartu dengan <strong>power paling tinggi</strong> agar manfaatnya maksimal.<br>
                        ✅ Kalau kamu duluan abis kartunya — kamu menang! 🚀
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- DRAW LEVEL INFO POPUP -->
    <div id="draw-level-overlay" onclick="playSound('button');hideDrawLevelInfo()">
        <div class="dl-modal" onclick="event.stopPropagation()">
            <div class="dl-header">
                <div class="dl-title">🎰 Draw Level</div>
                <button class="btn-enc-close" onclick="playSound('x');hideDrawLevelInfo()">✖</button>
            </div>
            <div class="dl-level-badge">
                <span class="dl-level-star" id="dl-star">⭐</span>
                <span class="dl-level-text" id="dl-level-text">Level 1</span>
            </div>
            <div class="dl-progress-wrap">
                <div class="dl-progress-label">
                    <span id="dl-progress-label-left">0 / 2 draw menuju Level 2</span>
                    <span id="dl-progress-label-right">0%</span>
                </div>
                <div class="dl-progress-bar-bg">
                    <div class="dl-progress-bar-fill" id="dl-progress-fill" style="width:0%"></div>
                </div>
            </div>
            <div class="dl-section-title">Rate kartu level ini</div>
            <div class="dl-rate-grid" id="dl-rate-grid"></div>
        </div>
    </div>

    <!-- TEMAN SCREEN -->
    <!-- ===== RANK INFO MODAL ===== -->
    <div id="rank-info-overlay" onclick="playSound('button');hideRankInfo()" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:30000;overflow-y:auto;padding:20px;box-sizing:border-box;">
        <div class="rank-info-modal" onclick="event.stopPropagation()">
            <div class="rank-info-header">
                <div class="rank-info-title">ℹ️ Sistem Rank</div>
                <button class="btn-enc-close" onclick="playSound('x');hideRankInfo()">✖ Tutup</button>
            </div>

            <!-- Daftar urutan rank -->
            <div class="rank-info-section-title">📊 Urutan Rank</div>
            <div style="display:flex; flex-wrap:wrap; gap:10px; padding:8px 16px 12px; justify-content:center; align-items:center;">
                <!-- Bronze -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Bronze.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#cd7f32;">Bronze</span>
                </div>
                <span style="color:rgba(255,255,255,0.45);font-size:1.4em;">›</span>
                <!-- Silver -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Silver.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#c0c0c0;">Silver</span>
                </div>
                <span style="color:rgba(255,255,255,0.45);font-size:1.4em;">›</span>
                <!-- Gold -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Gold.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#ffd700;">Gold</span>
                </div>
                <span style="color:rgba(255,255,255,0.45);font-size:1.4em;">›</span>
                <!-- Diamond -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Diamond.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#67e8f9;">Diamond</span>
                </div>
                <span style="color:rgba(255,255,255,0.45);font-size:1.4em;">›</span>
                <!-- Platinum -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Platinum.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#d946ef;">Platinum</span>
                </div>
                <span style="color:rgba(255,255,255,0.45);font-size:1.4em;">›</span>
                <!-- Platinum MAX -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <img src="gambar/rank/Platinum MAX.png" style="width:90px;height:90px;object-fit:contain;" onerror="this.style.display='none'">
                    <span style="font-size:0.9em;font-weight:bold;color:#d946ef;">Platinum MAX</span>
                </div>
            </div>

            <!-- Tabel perubahan poin -->
            <div class="rank-info-section-title" style="margin-top:20px;">🎯 Perubahan Poin per Posisi</div>
            <div class="rank-info-note">Setiap rank membutuhkan <strong>100 poin</strong> untuk naik ke rank berikutnya.</div>
            <table class="rank-info-table">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>🥇 #1</th>
                        <th>🥈 #2</th>
                        <th>🥉 #3</th>
                        <th>💀 #4</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td class="ri-tier bronze">Bronze</td><td class="plus">+60</td><td class="plus">+30</td><td class="plus">+15</td><td class="minus">-10</td></tr>
                    <tr><td class="ri-tier silver">Silver</td><td class="plus">+48</td><td class="plus">+24</td><td class="plus">+12</td><td class="minus">-17</td></tr>
                    <tr><td class="ri-tier gold">Gold</td><td class="plus">+36</td><td class="plus">+18</td><td class="plus">+9</td><td class="minus">-24</td></tr>
                    <tr><td class="ri-tier diamond">Diamond</td><td class="plus">+24</td><td class="plus">+12</td><td class="plus">+6</td><td class="minus">-31</td></tr>
                    <tr><td class="ri-tier platinum">Platinum</td><td class="plus">+15</td><td class="plus">+6</td><td class="plus">+3</td><td class="minus">-40</td></tr>
                </tbody>
            </table>
            <div class="rank-info-note">🛡️ <strong>Bronze</strong> — Tidak bisa turun rank, poin minimal 0.</div>
        </div>
    </div>

    <!-- ===== LEADERBOARD SCREEN ===== -->
    <div id="leaderboard-screen">
        <div class="enc-header">
            <div class="enc-title">🏆 Leaderboard</div>
            <button class="btn-enc-close" onclick="playSound('x');hideLeaderboard()">✖ Tutup</button>
        </div>
        <div style="padding:20px; max-width:680px; margin:0 auto;">
            <div class="friend-section-title" style="margin-bottom:16px;">🥇 Top 100 Pemain — Rank Tertinggi</div>
            <div id="leaderboard-list"><div class="profile-empty">Memuat leaderboard...</div></div>
        </div>
    </div>

    <div id="teman-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); z-index:15000; overflow-y:auto;">
        <div class="enc-header">
            <div class="enc-title">👥 Teman</div>
            <button class="btn-enc-close" onclick="playSound('x');hideTemanScreen()">✖ Tutup</button>
        </div>
        <div style="padding:20px; max-width:680px; margin:0 auto;">
            <!-- Cari Pemain -->
            <div class="friend-section-title">🔍 Cari Pemain</div>
            <div class="friend-search-row">
                <input type="text" class="friend-search-input" id="friend-search-input"
                       placeholder="Cari berdasarkan nama atau ID (#XXXXXX)..." maxlength="30"
                       onkeydown="if(event.key==='Enter')searchPlayers()">
                <button class="btn-friend-search" onclick="playSound('button');searchPlayers()">Cari</button>
            </div>
            <div id="friend-search-results"></div>

            <!-- Permintaan Teman Masuk -->
            <div class="friend-section-title">
                📩 Permintaan Masuk
                <span class="friend-req-badge" id="friend-req-badge"></span>
            </div>
            <div id="friend-requests-list"><div class="friend-pending">⏳ Memuat...</div></div>

            <!-- Daftar Teman -->
            <div class="friend-section-title">
                🤝 Daftar Teman
                <span id="friends-count" style="color:rgba(255,255,255,0.5);font-size:0.85em;font-weight:normal;"></span>
            </div>
            <div id="friends-list"><div class="friend-pending">⏳ Memuat...</div></div>
        </div>
    </div>

    <!-- PROFILE SCREEN -->
    <div id="profile-screen" style="display:none;">
        <button id="btn-profile-back" onclick="playSound('x');hideProfileScreen()">✕</button>
        <!-- Sidebar kiri -->
        <div id="profile-sidebar">
            <button class="profile-tab active" id="btn-tab-profil" onclick="playSound('button');switchProfileTab('profil')">👤 Profil Pemain</button>
            <button class="profile-tab" id="btn-tab-statistik" onclick="playSound('button');switchProfileTab('statistik')">📊 Statistik</button>
            <button class="profile-tab" id="btn-tab-riwayat" onclick="playSound('button');switchProfileTab('riwayat')">📜 Riwayat</button>
        </div>
        <!-- Konten kanan -->
        <div id="profile-content">
            <!-- Tab: Profil Pemain -->
            <div id="tab-profil" class="profile-panel active">
                <div class="profile-panel-title">👤 Profil Pemain</div>
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
                    <div title="Klik untuk ganti foto profil" onclick="playSound('button');showAvatarPicker()" style="cursor:pointer;flex-shrink:0;position:relative;">
                        <div id="prf-avatar-display" style="display:inline-block;"></div>
                        <div style="position:absolute;bottom:0;right:0;background:rgba(0,0,0,0.55);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;pointer-events:none;">✏️</div>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div class="profile-info-row">
                            <span class="profile-info-label">Nickname</span>
                            <span class="profile-info-value" id="prf-nickname">-</span>
                        </div>
                        <div class="profile-info-row">
                            <span class="profile-info-label">ID</span>
                            <span class="profile-info-value" id="prf-id" style="font-family:monospace;">-</span>
                        </div>
                        <div class="profile-info-row">
                            <span class="profile-info-label">Bergabung</span>
                            <span class="profile-info-value" id="prf-joined">-</span>
                        </div>
                    </div>
                </div>
                <!-- Rank Section -->
                <div class="profile-rank-section">
                    <div class="profile-rank-display">
                        <div class="profile-rank-item">
                            <div class="profile-rank-label">Rank Saat Ini</div>
                            <img id="prf-rank-img" src="gambar/rank/Bronze.png" alt="Bronze III" class="profile-rank-img">
                            <div class="profile-rank-name" id="prf-rank-name">Bronze III</div>
                            <div class="profile-rank-points" id="prf-rank-points">0 / 100 poin</div>
                        </div>
                        <div class="profile-rank-item">
                            <div class="profile-rank-label" style="display:flex;align-items:center;gap:6px;">
                                Rank Tertinggi
                                <button class="btn-rank-info" onclick="playSound('button');showRankInfo()" title="Info sistem rank">ℹ️</button>
                            </div>
                            <img id="prf-peak-img" src="gambar/rank/Bronze.png" alt="Bronze III" class="profile-rank-img">
                            <div class="profile-rank-name" id="prf-peak-name">Bronze III</div>
                            <div class="profile-rank-points" id="prf-peak-points">0 / 100 poin</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab: Statistik -->
            <div id="tab-statistik" class="profile-panel">
                <div class="profile-panel-title">📊 Statistik</div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🏆 Win Rate</span>
                    <span class="profile-stat-value highlight" id="stat-winrate">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🎮 Jumlah Pertandingan</span>
                    <span class="profile-stat-value" id="stat-total">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🎖️ Jumlah Menang</span>
                    <span class="profile-stat-value highlight" id="stat-wins">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">💀 Jumlah Kalah</span>
                    <span class="profile-stat-value" id="stat-losses">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥇 % Juara 1</span>
                    <span class="profile-stat-value" id="stat-p1">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥈 % Juara 2</span>
                    <span class="profile-stat-value" id="stat-p2">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥉 % Juara 3</span>
                    <span class="profile-stat-value" id="stat-p3">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">💀 % Juara 4</span>
                    <span class="profile-stat-value" id="stat-p4">0%</span>
                </div>
            </div>

            <!-- Tab: Riwayat -->
            <div id="tab-riwayat" class="profile-panel">
                <div class="profile-panel-title">📜 Riwayat</div>
                <div id="history-list">
                    <div class="profile-empty">Belum ada riwayat pertandingan.</div>
                </div>
            </div>

        </div>
    </div>

    <!-- HALAMAN PENUH: KUNJUNGI PROFIL PEMAIN LAIN -->
    <div id="visit-profile-screen">
        <button id="btn-visit-back" onclick="playSound('x');closeVisitProfile()">✕</button>
        <!-- Sidebar kiri -->
        <div id="visit-profile-sidebar">
            <button class="visit-tab active" id="btn-vtab-profil" onclick="playSound('button');switchVisitTab('profil')">👤 Profil</button>
            <button class="visit-tab" id="btn-vtab-statistik" onclick="playSound('button');switchVisitTab('statistik')">📊 Statistik</button>
            <button class="visit-tab" id="btn-vtab-riwayat" onclick="playSound('button');switchVisitTab('riwayat')">📜 Riwayat</button>
        </div>
        <!-- Konten kanan -->
        <div id="visit-profile-content">
            <!-- Tab Profil -->
            <div id="vtab-profil" class="visit-panel active">
                <div class="visit-panel-title">👤 Profil Pemain</div>
                <div class="vp-header">
                    <div class="vp-avatar" id="vp-avatar">👤</div>
                    <div>
                        <div class="vp-name" id="vp-name">-</div>
                        <div class="vp-uid" id="vp-uid">-</div>
                        <div class="vp-joined" id="vp-joined">-</div>
                    </div>
                </div>
                <div id="vp-friend-action"></div>
                <!-- Rank Section -->
                <div class="profile-rank-section" id="vp-rank-section" style="display:none;">
                    <div class="profile-rank-display">
                        <div class="profile-rank-item">
                            <div class="profile-rank-label">Rank Saat Ini</div>
                            <img id="vp-rank-img" src="gambar/rank/Bronze.png" alt="Bronze III" class="profile-rank-img">
                            <div class="profile-rank-name" id="vp-rank-name">Bronze III</div>
                            <div class="profile-rank-points" id="vp-rank-points">0 / 100 poin</div>
                        </div>
                        <div class="profile-rank-item">
                            <div class="profile-rank-label">Rank Tertinggi</div>
                            <img id="vp-peak-img" src="gambar/rank/Bronze.png" alt="Bronze III" class="profile-rank-img">
                            <div class="profile-rank-name" id="vp-peak-name">Bronze III</div>
                            <div class="profile-rank-points" id="vp-peak-points">0 / 100 poin</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Tab Statistik -->
            <div id="vtab-statistik" class="visit-panel">
                <div class="visit-panel-title">📊 Statistik</div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🏆 Win Rate</span>
                    <span class="profile-stat-value highlight" id="vp-stat-winrate">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🎮 Total Pertandingan</span>
                    <span class="profile-stat-value" id="vp-stat-total">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🎖️ Jumlah Menang</span>
                    <span class="profile-stat-value highlight" id="vp-stat-wins">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">💀 Jumlah Kalah</span>
                    <span class="profile-stat-value" id="vp-stat-losses">0</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥇 % Juara 1</span>
                    <span class="profile-stat-value" id="vp-stat-p1">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥈 % Juara 2</span>
                    <span class="profile-stat-value" id="vp-stat-p2">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">🥉 % Juara 3</span>
                    <span class="profile-stat-value" id="vp-stat-p3">0%</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-label">💀 % Juara 4</span>
                    <span class="profile-stat-value" id="vp-stat-p4">0%</span>
                </div>
            </div>
            <!-- Tab Riwayat -->
            <div id="vtab-riwayat" class="visit-panel">
                <div class="visit-panel-title">📜 Riwayat</div>
                <div id="vp-history-list">
                    <div class="profile-empty">Memuat riwayat...</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal lama (kosong, tetap ada agar tidak error referensi) -->
    <div id="view-profile-modal" style="display:none;"></div>

    <!-- SETTINGS SCREEN -->
    <div id="settings-screen" style="display:none;">
        <div class="settings-header">
            <span class="settings-title">⚙️ Pengaturan</span>
            <button class="btn-settings-close" onclick="playSound('x');hideSettingsScreen()">✖ Tutup</button>
        </div>
        <div class="settings-body">

            <div class="settings-section">
                <span class="settings-section-label">👤 Akun</span>
                <div class="settings-info-row">
                    <span class="settings-info-label">Email</span>
                    <span class="settings-info-value" id="settings-email">-</span>
                </div>
            </div>

            <div class="settings-section">
                <span class="settings-section-label">🔑 Ganti Kata Sandi</span>
                <button onclick="playSound('button');showChangePasswordModal()"
                        style="width:100%; margin-top:6px; padding:11px 16px; border-radius:10px; border:none; background:linear-gradient(135deg,#f39c12,#e67e22); color:#fff; font-weight:700; cursor:pointer; font-size:0.95em;">
                    🔑 Ganti Kata Sandi
                </button>
            </div>

            <div class="settings-section">
                <span class="settings-section-label">🎵 Volume Music 1 (Lobby)</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="vol-bgmusic1"
                           min="0" max="100" value="30"
                           oninput="applyVolumeBgMusic1(this.value)">
                    <span class="settings-slider-val" id="vol-bgmusic1-val">30%</span>
                </div>
            </div>

            <div class="settings-section">
                <span class="settings-section-label">🎶 Volume Music 2 (Game)</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="vol-bgmusic2"
                           min="0" max="100" value="30"
                           oninput="applyVolumeBgMusic2(this.value)">
                    <span class="settings-slider-val" id="vol-bgmusic2-val">30%</span>
                </div>
            </div>

            <div class="settings-section">
                <span class="settings-section-label">🔊 Volume Efek Suara</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="vol-sfx"
                           min="0" max="100" value="50"
                           oninput="applyVolumeSfx(this.value)">
                    <span class="settings-slider-val" id="vol-sfx-val">50%</span>
                </div>
            </div>

            <div class="settings-section">
                <span class="settings-section-label">🗺️ Tampilan</span>
                <div class="settings-toggle-row">
                    <span class="settings-toggle-label">Tampilkan nama provinsi saat kursor menyentuh kartu</span>
                    <label class="settings-toggle">
                        <input type="checkbox" id="toggle-province-tooltip"
                               onchange="applyProvinceTooltipSetting(this.checked)">
                        <span class="settings-toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-toggle-row" style="margin-top:12px;">
                    <span class="settings-toggle-label">Nama provinsi di bawah kartu</span>
                    <label class="settings-toggle">
                        <input type="checkbox" id="toggle-deck-province-label"
                               onchange="applyDeckProvinceLabelSetting(this.checked)">
                        <span class="settings-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <hr class="settings-divider">

            <button class="btn-logout-settings" onclick="playSound('button');confirmLogout()">🚪 Keluar</button>
        </div>
    </div>

    <!-- GAME CONTAINER -->
    <div class="game-container" id="game-container">
        <div class="main-content">

            <!-- KOLOM KIRI -->
            <div class="left-column">
                <!-- PANEL LAWAN -->
                <div class="opponents-panel" id="opponents-panel">
                    <div class="opponents-title">🛡️ Lawan 🛡️</div>
                    <div style="margin-bottom:8px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; text-align:center;">
                        <div style="font-size:0.85em; margin-bottom:5px;">📋 Tersisa: <strong id="draw-pile-count-2">0</strong></div>
                        <div style="font-size:0.85em;">📥 Terpakai: <strong id="discard-pile-count-2">0</strong></div>
                    </div>
                </div>
                <!-- PANEL KONEKSI -->
                <div class="ping-panel" id="ping-panel">
                    <div class="ping-title">🛜 Koneksi Pemain</div>
                    <div id="ping-list"></div>
                </div>
            </div>

            <!-- PANEL KANAN -->
            <div class="right-panel">

                <!-- AREA KARTU ATAS -->
                <div class="top-card-area" style="position:relative;">
                    <div class="province-label" id="province-label">Menunggu kartu...</div>
                    <button class="sync-refresh-btn" id="sync-refresh-btn" title="Refresh & sinkronisasi">🔄</button>
                    <button class="province-info-btn" id="province-info-btn" title="Lihat semua kartu provinsi">ℹ️</button>
                    <div class="top-cards" id="top-cards"></div>
                </div>

                <!-- AREA PEMAIN -->
                <div class="player-area">
                    <h2 style="margin:0 0 10px 0; text-align:left;" id="player-header-name">👤 ANDA</h2>
                    <div class="player-header">
                        <div class="player-stats">
                            <div class="player-stat">📇 Kartu: <strong id="player-cards">0</strong></div>
                            <div class="player-stat">⚡ Power: <strong id="player-power">0</strong></div>
                            <div style="margin-left:15px; display:flex; align-items:center; gap:5px;">
                                <button class="btn-draw" id="btn-draw" disabled>🎰 Draw Card</button>
                                <button class="btn-dl-info" id="btn-draw-level-info" onclick="playSound('button');showDrawLevelInfo()" title="Info Draw Level">ℹ️</button>
                            </div>
                            <div style="margin-left:15px; padding:8px 15px; background:rgba(255,255,255,0.2); border-radius:8px;">
                                <span style="font-weight:bold; font-size:0.9em;">🎮 Ronde: <strong id="round-number">1</strong></span>
                            </div>
                            <div style="margin-left:15px; padding:8px 15px; background:rgba(255,255,255,0.2); border-radius:8px;">
                                <span style="font-weight:bold; font-size:0.9em;">🕹️ Tahap: <strong id="phase-name">1</strong></span>
                            </div>
                            <div id="player-turn-notification" style="display:none; margin-left:15px; padding:8px 15px; background:#4caf50; border:2px solid #2e7d32; border-radius:8px;">
                                <span id="player-turn-notification-text" style="font-weight:bold; font-size:0.9em;">✅ Pilih kartu di bawah</span>
                            </div>
                            <div id="player-penalty" style="display:none; margin-left:15px; padding:8px 15px; background:rgba(244,67,54,0.9); border:2px solid #f44336; border-radius:8px;">
                                <span style="font-weight:bold; font-size:0.9em;" id="penalty-text">⚠️ Anda harus draw card</span>
                            </div>
                            <div id="player-freed-notification" style="display:none; margin-left:15px; padding:8px 15px; background:#4caf50; border:2px solid #2e7d32; border-radius:8px;">
                                <span style="font-weight:bold; font-size:0.9em;">✅ Dibebaskan</span>
                            </div>
                        </div>
                    </div>
                    <div class="player-deck-container">
                        <div class="player-deck" id="player-deck"></div>
                    </div>
                    <div class="log-area" id="game-log" style="margin-top:10px;">
                        <div class="log-entry">🎮 Menghubungkan ke server...</div>
                    </div>
                    <div style="margin-top:15px; text-align:center; padding-top:10px; border-top:2px solid rgba(255,255,255,0.15); display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                        <button id="btn-surrender" onclick="playSound('button');doSurrender()"
                            style="padding:12px 30px; font-size:1em; font-weight:bold;
                                   background:linear-gradient(135deg, #f44336 0%, #e53935 100%); color:#fff;
                                   border:2px solid #ef5350; border-radius:10px;
                                   cursor:pointer; transition:all 0.3s; box-shadow:0 4px 14px rgba(244,67,54,0.5);">
                            🏳️ Menyerah
                        </button>
                        <button id="btn-show-result" onclick="playSound('button');showMatchResult()"
                            style="display:none; padding:12px 30px; font-size:1em; font-weight:bold;
                                   background:linear-gradient(135deg,#667eea,#764ba2);
                                   color:white; border:none; border-radius:10px;
                                   cursor:pointer; transition:all 0.3s; box-shadow:0 4px 14px rgba(102,126,234,0.4);">
                            🏆 Hasil Pertandingan
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- IN-GAME SETTINGS PANEL -->
        <div id="ingame-settings-panel" style="display:none;">
            <div class="igs-header">
                <span class="igs-title">⚙️ Pengaturan</span>
                <button class="igs-close-btn" onclick="playSound('x');closeIngameSettings()">✖ Tutup</button>
            </div>
            <div class="igs-body">
                <span class="igs-section-label">🎵 Volume Music 1 (Lobby)</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="igs-vol-bgmusic1"
                           min="0" max="100" value="30"
                           oninput="applyVolumeBgMusic1(this.value)">
                    <span class="settings-slider-val" id="igs-vol-bgmusic1-val">30%</span>
                </div>

                <span class="igs-section-label" style="margin-top:12px;">🎶 Volume Music 2 (Game)</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="igs-vol-bgmusic2"
                           min="0" max="100" value="30"
                           oninput="applyVolumeBgMusic2(this.value)">
                    <span class="settings-slider-val" id="igs-vol-bgmusic2-val">30%</span>
                </div>

                <span class="igs-section-label" style="margin-top:12px;">🔊 Volume Efek Suara</span>
                <div class="settings-slider-row">
                    <input type="range" class="settings-slider" id="igs-vol-sfx"
                           min="0" max="100" value="50"
                           oninput="applyVolumeSfx(this.value)">
                    <span class="settings-slider-val" id="igs-vol-sfx-val">50%</span>
                </div>

                <hr class="igs-divider">

                <span class="igs-section-label">🗺️ Tampilan</span>
                <div class="settings-toggle-row" style="margin-top:8px;">
                    <span class="settings-toggle-label">Keterangan nama provinsi</span>
                    <label class="settings-toggle">
                        <input type="checkbox" id="igs-toggle-province-tooltip"
                               onchange="applyProvinceTooltipSetting(this.checked)">
                        <span class="settings-toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-toggle-row" style="margin-top:10px;">
                    <span class="settings-toggle-label">Nama provinsi di bawah kartu</span>
                    <label class="settings-toggle">
                        <input type="checkbox" id="igs-toggle-deck-province-label"
                               onchange="applyDeckProvinceLabelSetting(this.checked)">
                        <span class="settings-toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>

        <!-- IN-GAME SETTINGS BUTTON (bottom-left) -->
        <button id="btn-ingame-settings" onclick="playSound('button');toggleIngameSettings()" title="Pengaturan">⚙️</button>
    </div>

    <!-- PROCESSING NOTIFICATION -->
    <div class="processing-notification" id="processing-notification">
        <h3>⏳ MEMPROSES FORCE PICK...</h3>
        <div class="spinner"></div>
        <p id="processing-message">Menentukan siapa yang dibebaskan...</p>
    </div>

    <!-- PROVINCE INFO MODAL -->
    <div class="province-info-modal" id="province-info-modal">
        <div class="province-info-content">
            <div class="province-info-header">
                <h2 id="province-info-title">📍 Provinsi</h2>
                <div class="province-info-close" id="province-info-close">✕</div>
            </div>
            <div class="province-cards-grid" id="province-cards-grid"></div>
        </div>
    </div>

    <!-- SURRENDER CHOICE MODAL -->
    <div class="modal" id="surrender-choice-modal">
        <div class="modal-content" style="max-width:420px; text-align:center;">
            <h2 style="color:#e53935; font-size:2em; margin-bottom:8px;">🏳️ Kamu Menyerah</h2>
            <p style="color:#555; margin-bottom:24px; font-size:1em;">Pertandingan masih berlangsung.<br>Apa yang ingin kamu lakukan?</p>
            <div style="display:flex; flex-direction:column; gap:14px;">
                <button onclick="playSound('button');continueWatching()"
                    style="padding:14px 20px; font-size:1em; font-weight:bold;
                           background:linear-gradient(135deg,#667eea,#764ba2);
                           color:white; border:none; border-radius:12px; cursor:pointer;
                           transition:transform 0.15s; box-shadow:0 4px 15px rgba(102,126,234,0.4);"
                    onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                    👀 Lanjut Menonton
                </button>
                <button onclick="playSound('button');showMatchResult()"
                    style="padding:14px 20px; font-size:1em; font-weight:bold;
                           background:linear-gradient(135deg,#f6d365,#fda085);
                           color:white; border:none; border-radius:12px; cursor:pointer;
                           transition:transform 0.15s; box-shadow:0 4px 15px rgba(253,160,133,0.4);"
                    onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                    🏆 Hasil Pertandingan
                </button>
            </div>
        </div>
    </div>

    <!-- MATCH RESULT MODAL -->
    <div class="modal" id="match-result-modal">
        <div class="modal-content" style="max-width:480px;">
            <h2 style="font-size:1.3em; margin-bottom:3px;">📊 Hasil Pertandingan</h2>
            <p id="match-result-round" style="color:#888; font-size:0.8em; margin-bottom:8px;"></p>
            <div id="match-result-rankings" class="rankings" style="text-align:left; max-height:180px; overflow-y:auto;"></div>
            <div id="match-result-stats"
                style="margin-top:6px; padding:6px 10px; background:#f0f4ff;
                       border-radius:8px; font-size:0.78em; color:#555; text-align:left;"></div>
            <div id="match-result-rank-change"></div>
            <button onclick="playSound('button');goToHome()"
                style="margin-top:10px; width:100%; padding:10px; font-size:0.95em; font-weight:bold;
                       background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                       color:white; border:none; border-radius:10px; cursor:pointer;
                       box-shadow:0 4px 15px rgba(102,126,234,0.4); transition:transform 0.15s;"
                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                🎮 Kembali ke Home
            </button>
        </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div class="modal" id="change-password-modal" style="z-index:16000;">
        <div class="modal-content" style="max-width:400px;">
            <h2 style="font-size:1.6em; margin-bottom:6px; color:#f39c12;">🔑 Ganti Kata Sandi</h2>
            <p style="color:#888; font-size:0.88em; margin-bottom:20px;">Masukkan kata sandi lama terlebih dahulu untuk verifikasi.</p>
            <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
                <input type="password" id="cp-old-pass" placeholder="🔒 Kata sandi lama"
                       style="padding:11px 14px; border-radius:10px; border:1.5px solid #ddd; font-size:0.95em; outline:none; width:100%; box-sizing:border-box;">
                <input type="password" id="cp-new-pass" placeholder="🔑 Kata sandi baru"
                       style="padding:11px 14px; border-radius:10px; border:1.5px solid #ddd; font-size:0.95em; outline:none; width:100%; box-sizing:border-box;">
                <input type="password" id="cp-confirm-pass" placeholder="🔑 Konfirmasi kata sandi baru"
                       style="padding:11px 14px; border-radius:10px; border:1.5px solid #ddd; font-size:0.95em; outline:none; width:100%; box-sizing:border-box;">
                <div id="cp-msg" style="font-size:0.87em; min-height:1.2em; text-align:center; font-weight:600;"></div>
                <div style="display:flex; gap:10px; margin-top:4px;">
                    <button onclick="playSound('x');hideChangePasswordModal()"
                            style="flex:1; padding:12px; border-radius:10px; border:1.5px solid #ddd; background:#f5f5f5; color:#555; font-weight:600; cursor:pointer; font-size:0.95em;">
                        Batal
                    </button>
                    <button onclick="playSound('button');doChangePassword()"
                            style="flex:1; padding:12px; border-radius:10px; border:none; background:linear-gradient(135deg,#f39c12,#e67e22); color:#fff; font-weight:700; cursor:pointer; font-size:0.95em;">
                        🔑 Simpan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- GAME OVER MODAL -->
    <div class="modal" id="game-over-modal">
        <div class="modal-content">
            <h2>🏆 GAME OVER! 🏆</h2>
            <div class="rankings" id="rankings"></div>
            <div style="display:flex; gap:12px; margin-top:12px; justify-content:center; flex-wrap:wrap;">
                <button class="btn-draw" onclick="playSound('button');goToHome()"
                    style="font-size:0.95em; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); border-color:transparent;">
                    🎮 Kembali ke Home
                </button>
            </div>
        </div>
    </div>

    <!-- PENGEMBANG SCREEN -->
    <div id="pengembang-screen" style="display:none;">
        <div class="pengembang-header">
            <span class="pengembang-title">👨‍💻 Pengembang</span>
            <button class="btn-pengembang-close" onclick="playSound('x');hidePengembangScreen()">✖ Tutup</button>
        </div>
        <div class="pengembang-body">

            <!-- Panel 1: Pembuat -->
            <div class="dev-panel">
                <div class="dev-panel-role">Pembuat</div>
                <img class="dev-panel-photo" src="gambar/pengembang/pembuat.jpg" alt="Foto Pembuat">
                <div class="dev-panel-name">Nama Pembuat</div>
                <div class="dev-panel-info">NIM: 000000000</div>
            </div>

            <!-- Panel 2: Dosen Pembimbing 1 -->
            <div class="dev-panel">
                <div class="dev-panel-role">Dosen Pembimbing 1</div>
                <img class="dev-panel-photo" src="gambar/pengembang/dospem1.jpg" alt="Foto Dosen Pembimbing 1">
                <div class="dev-panel-name">Nama Dosen Pembimbing 1</div>
                <div class="dev-panel-info">NBM: 000000000</div>
            </div>

            <!-- Panel 3: Dosen Pembimbing 2 -->
            <div class="dev-panel">
                <div class="dev-panel-role">Dosen Pembimbing 2</div>
                <img class="dev-panel-photo" src="gambar/pengembang/dospem2.jpg" alt="Foto Dosen Pembimbing 2">
                <div class="dev-panel-name">Nama Dosen Pembimbing 2</div>
                <div class="dev-panel-info">NBM: 000000000</div>
            </div>

            <!-- Panel 4: Dosen Pembimbing Akademik -->
            <div class="dev-panel">
                <div class="dev-panel-role">Dosen Pembimbing Akademik</div>
                <img class="dev-panel-photo" src="gambar/pengembang/dospan.jpg" alt="Foto Dosen Pembimbing Akademik">
                <div class="dev-panel-name">Nama Dosen Pembimbing Akademik</div>
                <div class="dev-panel-info">NBM: 000000000</div>
            </div>

        </div>
    </div>

    <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
        // =============================================
        // ASSET VERSION (cache busting) — naikkan angka ini setiap upload aset baru
        // =============================================
        const ASSET_V = '1.0';
        const av = (path) => `${path}?v=${ASSET_V}`;

        // =============================================
        // FIREBASE INITIALIZATION
        // =============================================
        const firebaseConfig = {
            apiKey: "AIzaSyDPxYUUHC9zr8W38qV2dbrYNH7fo_PyhTQ",
            authDomain: "rex-server-8a176.firebaseapp.com",
            databaseURL: "https://rex-server-8a176-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "rex-server-8a176",
            storageBucket: "rex-server-8a176.firebasestorage.app",
            messagingSenderId: "614405006496",
            appId: "1:614405006496:web:e33c399adac1b6735e55c5",
            measurementId: "G-XG6V4Z07BZ"
        };
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.database();

        // =============================================
        // RANK SYSTEM
        // =============================================
        const RANKS = [
            'Bronze III', 'Bronze II', 'Bronze I',
            'Silver III', 'Silver II', 'Silver I',
            'Gold III',   'Gold II',   'Gold I',
            'Diamond III','Diamond II','Diamond I',
            'Platinum III','Platinum II','Platinum I',
            'Platinum MAX'
        ];
        const RANK_CHANGES = {
            'Bronze':   [60, 30, 15, -10],
            'Silver':   [48, 24, 12, -17],
            'Gold':     [36, 18,  9, -24],
            'Diamond':  [24, 12,  6, -31],
            'Platinum': [15,  6,  3, -40]
        };
        function getRankTier(rankName) {
            if (rankName === 'Platinum MAX') return 'Platinum';
            const t = ['Bronze','Silver','Gold','Diamond','Platinum'].find(x => rankName.startsWith(x));
            return t || 'Bronze';
        }
        // Gambar rank: Bronze pakai Bronze.png, dst.
        // Platinum MAX pakai Platinum MAX.png (beda gambar)
        function rankImgSrc(rankName) {
            if (!rankName) return av('gambar/rank/Bronze.png');
            if (rankName === 'Platinum MAX') return av('gambar/rank/Platinum MAX.png');
            return av(`gambar/rank/${getRankTier(rankName)}.png`);
        }
        function calculateNewRank(rankName, points, position) {
            // Validasi input untuk mencegah crash saat data tidak valid
            if (!RANKS.includes(rankName)) rankName = 'Bronze III';
            if (position < 1 || position > 4) return { rankName, points };
            const tier    = getRankTier(rankName);
            const change  = RANK_CHANGES[tier][position - 1];
            const idx     = RANKS.indexOf(rankName);
            let newPoints   = points + change;
            let newRankName = rankName;
            if (newPoints >= 100) {
                // Promote to next rank
                if (idx < RANKS.length - 1) {
                    newRankName = RANKS[idx + 1];
                    newPoints   = newPoints - 100;
                }
            } else if (newPoints < 0) {
                // Bronze III: cannot demote below this rank
                if (rankName === 'Bronze III') {
                    newPoints = 0;
                } else {
                    const deficit = -newPoints;
                    newRankName   = RANKS[idx - 1];
                    newPoints     = Math.max(0, 100 - deficit);
                }
            }
            return { rankName: newRankName, points: newPoints };
        }

        // =============================================
        // LOCALSTORAGE KEYS
        // =============================================
        const LS = {
            ROOM_ID:          'cgn_roomId',
            PLAYER_ID:        'cgn_playerId',
            IS_SPECTATOR:     'cgn_isSpectator',
            NICKNAME:         'cgn_nickname',
            USER_UID:         'cgn_userUid',
            USER_EMAIL:       'cgn_userEmail',
            GAME_ACTIVE:      'cgn_gameActive',
            PROVINCE_TOOLTIP:    'cgn_province_tooltip',
            DECK_PROVINCE_LABEL: 'cgn_deck_province_label',
        };

        function lsSet(key, value) { try { localStorage.setItem(key, value); } catch(e) {} }
        function lsGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
        function lsDel(key) { try { localStorage.removeItem(key); } catch(e) {} }
        function lsClear() { Object.values(LS).forEach(k => lsDel(k)); }

        // =============================================
        // AUTH STATE - Firebase login checker
        // =============================================
        let currentUser = null;
        let currentNickname = null;

        // Jalankan pre-loading steps di firebase-loading screen (sebelum login)
        var preloadingDone = false;
        (function runEarlyPreload() {
            const el = document.querySelector('#firebase-loading div:last-child');
            if (!el) return;
            const steps = [
                'Memuat 190 kartu provinsi...',
                'Memuat gambar dan aset...',
                'Menyiapkan sound effects...',
                'Mempersiapkan sistem game...',
                'Validasi data kartu...',
                'Hampir selesai...'
            ];
            let i = 0;
            const iv = setInterval(() => {
                if (i < steps.length) {
                    el.textContent = steps[i++];
                } else {
                    clearInterval(iv);
                    el.textContent = 'Siap!';
                    preloadingDone = true;
                }
            }, 800);
        })();

        let _lastAuthUid = null;
        auth.onAuthStateChanged(async (user) => {
            if (user && user.uid === _lastAuthUid) return;
            _lastAuthUid = user ? user.uid : null;
            // Tunggu preloading selesai, baru sembunyikan firebase-loading
            function hideFirebaseLoading(cb) {
                function tryHide() {
                    if (preloadingDone) {
                        const fl = document.getElementById('firebase-loading');
                        fl.style.transition = 'opacity 0.6s ease';
                        fl.style.opacity = '0';
                        setTimeout(() => { fl.style.display = 'none'; if(cb) cb(); }, 600);
                    } else {
                        setTimeout(tryHide, 100);
                    }
                }
                tryHide();
            }
            hideFirebaseLoading();
            
            if (user) {
                currentUser = user;
                lsSet(LS.USER_UID, user.uid);
                lsSet(LS.USER_EMAIL, user.email);
                
                // Cek apakah sudah punya nickname di DB
                try {
                const snap = await db.ref(`users/${user.uid}/nickname`).get();
                if (snap.exists()) {
                    currentNickname = snap.val();
                    lsSet(LS.NICKNAME, currentNickname);
                    onAuthAndNicknameReady(user, currentNickname);
                } else {
                    // Belum punya nickname, tampilkan nickname screen
                    hideAuthScreen();
                    showNicknameScreen();
                }
                } catch(e) {
                    // Firebase DB gagal — fallback ke nickname lokal
                    currentNickname = lsGet(LS.NICKNAME) || null;
                    if (currentNickname) {
                        onAuthAndNicknameReady(user, currentNickname);
                    } else {
                        hideAuthScreen();
                        showNicknameScreen();
                    }
                }
            } else {
                currentUser = null;
                currentNickname = null;
                showAuthScreen();
            }
        });

        // =============================================
        // AUTH SCREEN FUNCTIONS
        // =============================================
        function showAuthScreen() {
            document.getElementById('auth-screen').style.display = 'flex';
            document.getElementById('nickname-screen').style.display = 'none';
            document.getElementById('pre-loading-screen').style.display = 'none';
            document.getElementById('matchmaking-screen').classList.remove('active');
            document.getElementById('game-container').classList.remove('active');
            // Reset state UI agar tidak "stuck" dari sesi sebelumnya
            setAuthLoading(false);
            showAuthError('');
            switchAuthTab('login');
        }

        function hideAuthScreen() {
            document.getElementById('auth-screen').style.display = 'none';
        }

        function showNicknameScreen() {
            document.getElementById('nickname-screen').style.display = 'flex';
            document.getElementById('pre-loading-screen').style.display = 'none';
        }

        function hideNicknameScreen() {
            document.getElementById('nickname-screen').style.display = 'none';
        }

        let _setupSelectedAvatar = '1';

        function showAvatarSetupScreen() {
            _setupSelectedAvatar = _selectedAvatar || '1';
            for (let i = 0; i < 9; i++) {
                document.getElementById('avs-opt-' + i).classList.toggle('selected', _setupSelectedAvatar === String(i + 1));
            }
            const previewImg = document.getElementById('avs-preview-img');
            if (previewImg) previewImg.src = av(`gambar/avatar/avatar${_setupSelectedAvatar}.png`);
            document.getElementById('avatar-setup-screen').style.display = 'flex';
        }

        function selectAvatarSetup(index) {
            _setupSelectedAvatar = String(index + 1);
            for (let i = 0; i < 9; i++) {
                document.getElementById('avs-opt-' + i).classList.toggle('selected', i === index);
            }
            const previewImg = document.getElementById('avs-preview-img');
            if (previewImg) previewImg.src = av(`gambar/avatar/avatar${_setupSelectedAvatar}.png`);
        }

        function saveAvatarSetup() {
            _selectedAvatar = _setupSelectedAvatar;
            localStorage.setItem('selectedAvatar', _selectedAvatar);
            if (currentUser) {
                db.ref(`userAvatars/${currentUser.uid}`).set(_selectedAvatar).catch(() => {});
            }
            document.getElementById('avatar-setup-screen').style.display = 'none';
            onAuthAndNicknameReady(currentUser, currentNickname);
        }

        function switchAuthTab(tab) {
            document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
            document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
            document.querySelectorAll('.auth-tab').forEach((el, i) => {
                el.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
            });
            showAuthError('');
        }

        function showAuthError(msg) {
            const el = document.getElementById('auth-error');
            el.textContent = msg;
            el.style.display = msg ? 'block' : 'none';
        }

        function setAuthLoading(show) {
            document.getElementById('auth-loading').style.display = show ? 'block' : 'none';
        }

        // =============================================
        // LOGIN
        // =============================================
        async function doLogin() {
            const email = document.getElementById('login-email').value.trim();
            const pass  = document.getElementById('login-password').value;
            if (!email || !pass) { showAuthError('⚠️ Email dan password tidak boleh kosong!'); return; }
            setAuthLoading(true); showAuthError('');
            try {
                await auth.signInWithEmailAndPassword(email, pass);
                // onAuthStateChanged akan otomatis terpanggil
            } catch (e) {
                const msgs = {
                    'auth/user-not-found':           '❌ Akun tidak ditemukan!',
                    'auth/wrong-password':           '❌ Password salah!',
                    'auth/invalid-email':            '❌ Format email tidak valid!',
                    'auth/too-many-requests':        '❌ Terlalu banyak percobaan, coba lagi nanti!',
                    // Firebase baru menggabungkan user-not-found + wrong-password menjadi satu kode:
                    'auth/invalid-credential':       '❌ Email atau password salah!',
                    'auth/invalid-login-credentials':'❌ Email atau password salah!',
                    'auth/network-request-failed':   '❌ Gagal terhubung ke server! Periksa koneksi internet.',
                    'auth/user-disabled':            '❌ Akun ini telah dinonaktifkan.',
                };
                showAuthError(msgs[e.code] || `❌ Login gagal: ${e.message}`);
                setAuthLoading(false);
            }
        }

        // =============================================
        // REGISTER
        // =============================================
        async function doRegister() {
            const email   = document.getElementById('reg-email').value.trim().toLowerCase();
            const pass    = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            if (!email || !pass) { showAuthError('⚠️ Email dan password tidak boleh kosong!'); return; }
            if (!email.endsWith('@cardgame.local')) { showAuthError('⚠️ Email harus berformat: namakamu@cardgame.local'); return; }
            if (email === '@cardgame.local') { showAuthError('⚠️ Bagian sebelum @ tidak boleh kosong!'); return; }

            const usernameInput = email.split('@')[0];
            if (usernameInput === 'muridbaik') {
                showAuthError('⚠️ Username tersebut tidak boleh digunakan, pilih username lain!');
                return;
            }

            if (pass.length < 6) { showAuthError('⚠️ Password minimal 6 karakter!'); return; }
            if (pass !== confirm) { showAuthError('⚠️ Konfirmasi password tidak cocok!'); return; }
            setAuthLoading(true); showAuthError('');
            try {
                await auth.createUserWithEmailAndPassword(email, pass);
            } catch (e) {
                const msgs = {
                    'auth/email-already-in-use': '❌ Email sudah digunakan!',
                    'auth/invalid-email': '❌ Format email tidak valid!',
                    'auth/weak-password': '❌ Password terlalu lemah!',
                };
                showAuthError(msgs[e.code] || `❌ Error: ${e.message}`);
                setAuthLoading(false);
            }
        }

        // =============================================
        // NICKNAME
        // =============================================
        function previewNickname(val) {
            document.getElementById('nickname-preview').textContent = val || '...';
        }

        function showNicknameError(msg) {
            const el = document.getElementById('nickname-error');
            el.textContent = msg;
            el.style.display = msg ? 'block' : 'none';
        }

        async function saveNickname() {
            const nick = document.getElementById('nickname-input').value.trim();
            if (!nick) { showNicknameError('⚠️ Nickname tidak boleh kosong!'); return; }
            if (nick.length < 3) { showNicknameError('⚠️ Nickname minimal 3 karakter!'); return; }
            if (nick.length > 20) { showNicknameError('⚠️ Nickname maksimal 20 karakter!'); return; }
            if (!/^[a-zA-Z0-9 _]+$/.test(nick)) { showNicknameError('⚠️ Hanya huruf, angka, spasi, underscore!'); return; }
            
            showNicknameError('');
            try {
                await currentUser.getIdToken(true); // force-refresh token untuk akun baru
                await db.ref(`users/${currentUser.uid}`).update({
                    nickname: nick,
                    email: currentUser.email,
                });
                currentNickname = nick;
                lsSet(LS.NICKNAME, nick);
                hideNicknameScreen();
                showAvatarSetupScreen();
            } catch(e) {
                showNicknameError('❌ Gagal menyimpan nickname: ' + e.message);
            }
        }

        // =============================================
        // AFTER LOGIN + NICKNAME READY
        // =============================================
        function onAuthAndNicknameReady(user, nickname) {
            setAuthLoading(false);
            hideAuthScreen();        // ← pastikan form login tertutup sebelum tampilkan layar berikutnya
            hideNicknameScreen();    // ← pastikan nickname screen juga tertutup

            // Load avatar from Firebase (sync across devices), fallback to localStorage
            db.ref(`userAvatars/${user.uid}`).get().then(avSnap => {
                if (avSnap.exists()) {
                    _selectedAvatar = String(avSnap.val());
                    localStorage.setItem('selectedAvatar', _selectedAvatar);
                } else {
                    // First time: sync localStorage avatar (or default 7) to Firebase
                    if (!_selectedAvatar) _selectedAvatar = '7';
                    db.ref(`userAvatars/${user.uid}`).set(_selectedAvatar).catch(() => {});
                }
                updateProfileAvatar();
            }).catch(() => { if (!_selectedAvatar) _selectedAvatar = '7'; });

            showProfileBadge(user.uid, nickname);
            _startPartyInviteListener();        // dengarkan undangan party dari teman
            _startFriendRequestBadge();         // update badge notifikasi di tombol Teman
            _startCustomRoomInviteListener();   // dengarkan undangan custom room

            // Cek & tandai presence (deteksi login di device lain)
            setupPresence(user, nickname);
            
            // Cek localStorage apakah ada sesi pertandingan aktif
            const savedRoomId    = lsGet(LS.ROOM_ID);
            const savedPlayerId  = lsGet(LS.PLAYER_ID);
            const savedSpectator = lsGet(LS.IS_SPECTATOR);
            const gameActive     = lsGet(LS.GAME_ACTIVE);
            const savedUid       = lsGet(LS.USER_UID);

            if (savedRoomId && savedSpectator === 'true' && gameActive === 'true' && savedUid === user.uid) {
                // Sesi spectator — reconnect sebagai penonton
                showPreloadingScreen(false);
                setTimeout(() => { reconnectAsSpectator(savedRoomId); }, 1500);
            } else if (savedRoomId && savedPlayerId && gameActive === 'true' && savedUid === user.uid) {
                // Sesi pemain biasa — reconnect normal
                showPreloadingScreen(false);
                setTimeout(() => { reconnectToGame(savedRoomId, savedPlayerId); }, 1500);
            } else {
                // Hapus sesi lama yang bukan milik user ini
                lsDel(LS.ROOM_ID);
                lsDel(LS.PLAYER_ID);
                lsDel(LS.IS_SPECTATOR);
                lsDel(LS.GAME_ACTIVE);
                // Tidak ada localStorage — coba cari room aktif di server via userUid
                // (untuk support login di device berbeda)
                showPreloadingScreen(false);
                findMyRoomOnServer(user.uid);
            }
        }

        // Tampilkan tombol PLAY di home screen
        function showHomeButtons() {
            const infoEl = document.getElementById('pre-loading-info');
            const spinnerEl = document.getElementById('pre-loading-spinner');
            const subtitleEl = document.querySelector('.pre-loading-subtitle');
            const playBtn = document.getElementById('btn-play');
            if (infoEl) infoEl.style.display = 'none';
            if (spinnerEl) spinnerEl.style.display = 'none';
            if (subtitleEl) subtitleEl.style.display = 'none';
            if (playBtn) playBtn.style.display = 'block';
        }

        // Cari room aktif berdasarkan userUid — untuk login di device berbeda
        function findMyRoomOnServer(userUid) {
            let resolved = false;
            let tempWs = null;

            const done = (found, roomId, playerId, isSpectator = false) => {
                if (resolved) return;
                resolved = true;
                clearTimeout(findRoomTimeout);
                if (tempWs) { tempWs.onclose = null; try { tempWs.close(); } catch(e) {} tempWs = null; }
                if (found) {
                    lsSet(LS.ROOM_ID, roomId);
                    lsSet(LS.GAME_ACTIVE, 'true');
                    if (isSpectator) {
                        lsSet(LS.IS_SPECTATOR, 'true');
                        lsDel(LS.PLAYER_ID);
                        addLog('🔍 Pertandingan aktif ditemukan! Menyambung kembali sebagai penonton...');
                        reconnectAsSpectator(roomId);
                    } else {
                        lsSet(LS.PLAYER_ID, playerId);
                        lsDel(LS.IS_SPECTATOR);
                        addLog('🔍 Pertandingan aktif ditemukan! Menyambung kembali...');
                        reconnectToGame(roomId, playerId);
                    }
                } else {
                    showHomeButtons();
                }
            };

            const findRoomTimeout = setTimeout(() => done(false), 5000);

            try {
                tempWs = new WebSocket(SERVER_URL);
                tempWs.onopen  = () => tempWs.send(JSON.stringify({ type: 'FIND_MY_ROOM', userUid }));
                tempWs.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'ROOM_FOUND') {
                        if (data.isSpectator) done(true, data.roomId, null, true);
                        else done(true, data.roomId, data.playerId);
                    } else if (data.type === 'ROOM_NOT_FOUND') {
                        done(false);
                    }
                };
                tempWs.onerror = () => done(false);
                tempWs.onclose = () => done(false);
            } catch(e) {
                done(false);
            }
        }

        // =============================================
        // PROFILE BADGE
        // =============================================
        // =============================================
        // AVATAR FOTO PROFIL
        // =============================================
        let _selectedAvatar = localStorage.getItem('selectedAvatar') || '7';
        let _cachedRankName = 'Bronze III';

        function updateProfileAvatar() {
            const el = document.getElementById('profile-avatar');
            if (_selectedAvatar) {
                el.innerHTML = `<img src="${av(`gambar/avatar/avatar${_selectedAvatar}.png`)}" alt="avatar">`;
            } else {
                const nickname = document.getElementById('profile-nickname-display').textContent || '?';
                el.textContent = nickname.charAt(0).toUpperCase();
            }
            el.style.cssText += _getRankFrameStyle(_cachedRankName);
            const dispEl = document.getElementById('prf-avatar-display');
            if (dispEl) dispEl.innerHTML = _getAvatarWithFrameHtml(72);
        }

        function showAvatarPicker() {
            const overlay = document.getElementById('avatar-picker-overlay');
            overlay.style.display = 'flex';
            for (let i = 0; i < 9; i++) {
                document.getElementById('av-opt-' + i).classList.toggle('selected', _selectedAvatar === String(i + 1));
            }
        }

        function hideAvatarPicker() {
            document.getElementById('avatar-picker-overlay').style.display = 'none';
        }

        function selectAvatar(index) {
            _selectedAvatar = String(index + 1);
            localStorage.setItem('selectedAvatar', _selectedAvatar);
            for (let i = 0; i < 9; i++) {
                document.getElementById('av-opt-' + i).classList.toggle('selected', i === index);
            }
            if (currentUser) {
                db.ref(`userAvatars/${currentUser.uid}`).set(_selectedAvatar).catch(() => {});
            }
            updateProfileAvatar();
        }

        function _getRankFrameStyle(rankName) {
            const tier = getRankTier(rankName || 'Bronze III');
            const c = ({
                'Bronze':   ['#cd7f32', 'rgba(205,127,50,0.55)'],
                'Silver':   ['#c0c0c0', 'rgba(192,192,192,0.55)'],
                'Gold':     ['#ffd700', 'rgba(255,215,0,0.65)'],
                'Diamond':  ['#67e8f9', 'rgba(103,232,249,0.65)'],
                'Platinum': ['#38bdf8', 'rgba(56,189,248,0.65)'],
            })[tier] || ['#cd7f32', 'rgba(205,127,50,0.55)'];
            return `border:3px solid ${c[0]};box-shadow:0 0 10px ${c[1]},0 0 20px ${c[1]};`;
        }

        function _getAvatarWithFrameHtml(size) {
            size = size || 50;
            const nick = currentNickname || lsGet(LS.NICKNAME) || '?';
            const fl = nick.charAt(0).toUpperCase();
            const frameStyle = _getRankFrameStyle(_cachedRankName);
            const base = `width:${size}px;height:${size}px;border-radius:${Math.round(size*0.18)}px;overflow:hidden;${frameStyle}display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:${Math.round(size*0.4)}px;font-weight:bold;color:white;`;
            if (_selectedAvatar) {
                return `<div style="${base}"><img src="${av(`gambar/avatar/avatar${_selectedAvatar}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none'"></div>`;
            }
            return `<div style="${base}">${fl}</div>`;
        }

        function showProfileBadge(uid, nickname) {
            document.getElementById('profile-nickname-display').textContent = nickname;

            // Tampilkan ID pendek (6 karakter terakhir UID)
            const shortId = uid.slice(-6).toUpperCase();
            document.getElementById('profile-id-display').textContent = `ID: #${shortId}`;

            // Avatar: foto jika dipilih, atau huruf pertama
            updateProfileAvatar();

            // Klik badge untuk buka profil
            document.getElementById('profile-badge').onclick = () => { playSound('button'); showProfileScreen(); };
            document.getElementById('profile-badge').title = 'Lihat profil pemain';
        }

        // =============================================
        // ONLINE PRESENCE (deteksi multi-device)
        // =============================================
        let _presenceRef = null;
        let _connectedRef = null;
        // Real-time listener refs untuk profile & leaderboard
        let _profileListeners = { rankData: null, stats: null, history: null };
        let _leaderboardRef = null;

        /**
         * Tulis status online ke Firebase Realtime DB.
         * Jika akun sudah online di device lain → tampilkan notifikasi.
         */
        async function setupPresence(user, nickname) {
            clearPresence(); // bersihkan listener lama jika ada

            const uid = user.uid;
            _presenceRef = db.ref(`presence/${uid}`);

            // Deteksi jenis perangkat
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const deviceLabel = isMobile ? '📱 HP/Tablet' : '💻 PC/Laptop';

            // ── Cek apakah sudah ada sesi lain yang aktif ──
            try {
                const snap = await _presenceRef.get();
                if (snap.exists()) {
                    const other = snap.val();
                    // Tampilkan peringatan sesi lain (hanya jika data ada)
                    showOnlineElsewhereNotification(other.device || 'perangkat lain', other.nickname || nickname);
                }
            } catch(e) { /* network issue — abaikan */ }

            // ── Pasang listener koneksi Firebase ──
            // Saat terkoneksi: tulis presence + jadwalkan hapus saat disconnect
            _connectedRef = db.ref('.info/connected');
            _connectedRef.on('value', (snap) => {
                if (snap.val() !== true) return;
                _presenceRef.onDisconnect().remove();
                _presenceRef.set({
                    nickname,
                    device:   deviceLabel,
                    loginAt:  Date.now(),
                    online:   true,
                });
            });
        }

        /** Set status busy/idle di presence node (inQueue, inLobby, inGame, atau hapus jika online). */
        function _setPresenceStatus(status) {
            if (!currentUser || !db) return;
            const ref = db.ref(`presence/${currentUser.uid}/status`);
            if (!status || status === 'online') {
                ref.remove().catch(() => {});
            } else {
                ref.set(status).catch(() => {});
            }
        }

        /** Hapus presence dan lepas listener saat logout/tutup. */
        function clearPresence() {
            if (_connectedRef) {
                _connectedRef.off();
                _connectedRef = null;
            }
            if (_presenceRef) {
                _presenceRef.onDisconnect().cancel();
                _presenceRef.remove().catch(() => {});
                _presenceRef = null;
            }
        }

        /** Pasang real-time listeners untuk profile (rankData, stats, history). */
        function attachProfileListeners() {
            if (!currentUser) return;
            detachProfileListeners();
            const uid = currentUser.uid;
            const medals = { 1: '🥇 Juara 1', 2: '🥈 Juara 2', 3: '🥉 Juara 3', 4: '💀 Juara 4' };

            // ── rankData (profil tab) ──
            _profileListeners.rankData = db.ref(`users/${uid}/rankData`);
            _profileListeners.rankData.on('value', snap => {
                const r = snap.exists() ? snap.val() : { rankName: 'Bronze III', points: 0, peakRank: 'Bronze III' };
                const rankName = r.rankName || 'Bronze III';
                const points   = r.points   || 0;
                const peakRank = r.peakRank || 'Bronze III';
                const peakPts  = peakRank === rankName
                    ? Math.max(r.peakRankPoints || 0, points)
                    : (r.peakRankPoints || 0);
                const isMax = rankName === 'Platinum MAX';
                _cachedRankName = rankName;
                const ri = document.getElementById('prf-rank-img');
                const pi = document.getElementById('prf-peak-img');
                if (ri) { ri.src = rankImgSrc(rankName); ri.alt = rankName; }
                if (pi) { pi.src = rankImgSrc(peakRank); pi.alt = peakRank; }
                const rn = document.getElementById('prf-rank-name');   if (rn) rn.textContent = rankName;
                const rp = document.getElementById('prf-rank-points'); if (rp) rp.textContent = isMax ? `${points} poin` : `${points} / 100 poin`;
                const pn = document.getElementById('prf-peak-name');   if (pn) pn.textContent = peakRank;
                const pp = document.getElementById('prf-peak-points'); if (pp) pp.textContent = `${peakPts} poin`;
                updateProfileAvatar();
            });

            // ── stats (statistik tab) ──
            _profileListeners.stats = db.ref(`users/${uid}/stats`);
            _profileListeners.stats.on('value', snap => {
                const s = snap.exists() ? snap.val() : { totalMatches: 0, rank1: 0, rank2: 0, rank3: 0, rank4: 0 };
                const total = s.totalMatches || 0;
                const pct = n => total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%';
                const totalWins = (s.rank1 || 0) + (s.rank2 || 0) + (s.rank3 || 0);
                const el = id => document.getElementById(id);
                if (el('stat-total'))   el('stat-total').textContent   = total;
                if (el('stat-wins'))    el('stat-wins').textContent    = totalWins;
                if (el('stat-losses')) el('stat-losses').textContent  = s.rank4 || 0;
                if (el('stat-winrate'))el('stat-winrate').textContent = pct(totalWins);
                if (el('stat-p1'))     el('stat-p1').textContent      = pct(s.rank1 || 0);
                if (el('stat-p2'))     el('stat-p2').textContent      = pct(s.rank2 || 0);
                if (el('stat-p3'))     el('stat-p3').textContent      = pct(s.rank3 || 0);
                if (el('stat-p4'))     el('stat-p4').textContent      = pct(s.rank4 || 0);
            });

            // ── history (riwayat tab) ──
            // Tampilkan loading dulu sebelum listener fire dengan data server
            const _histListEl = document.getElementById('history-list');
            if (_histListEl) _histListEl.innerHTML = '<div class="profile-empty">Memuat riwayat...</div>';
            _profileListeners.history = db.ref(`users/${uid}/history`).orderByKey().limitToLast(10);
            _profileListeners.history.on('value', snap => {
                const listEl = document.getElementById('history-list');
                if (!listEl) return;
                if (!snap.exists()) {
                    listEl.innerHTML = '<div class="profile-empty">Belum ada riwayat pertandingan.</div>';
                    return;
                }
                const items = [];
                snap.forEach(child => { items.push(child.val()); });
                items.reverse();
                try {
                listEl.innerHTML = items.map((m, i) => {
                    const d = new Date(m.date);
                    const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const pts = m.ptsChange;
                    const ptsHtml = pts == null ? '' :
                        `<span class="phi-pts ${pts > 0 ? 'plus' : pts < 0 ? 'minus' : 'zero'}">${pts > 0 ? '+' : ''}${pts} poin</span>`;
                    const rankRowHtml = (m.rankBefore && m.rankAfter)
                        ? `<div class="phi-rank-row">
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankBefore)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankBefore}</span>
                                <span class="phi-rank-pts">${m.ptsBefore != null ? m.ptsBefore : 0} poin</span>
                            </div>
                            <span class="phi-arrow">→</span>
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankAfter)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankAfter}</span>
                                <span class="phi-rank-pts">${m.ptsAfter != null ? m.ptsAfter : 0} poin</span>
                            </div>
                            <span class="phi-date">${tanggal}</span>
                          </div>`
                        : `<span class="phi-date">${tanggal}</span>`;
                    return `<div class="profile-history-item">
                        <div class="phi-header">
                            <span class="phi-result">${i + 1}. ${medals[m.rank] || `Juara ${m.rank}`}</span>
                            ${ptsHtml}
                        </div>
                        ${rankRowHtml}
                    </div>`;
                }).join('');
                } catch(err) { listEl.innerHTML = '<div class="profile-empty">Error memuat riwayat.</div>'; }
            });
        }

        /** Lepas semua real-time listeners profile. */
        function detachProfileListeners() {
            if (_profileListeners.rankData) { _profileListeners.rankData.off(); _profileListeners.rankData = null; }
            if (_profileListeners.stats)    { _profileListeners.stats.off();    _profileListeners.stats    = null; }
            if (_profileListeners.history)  { _profileListeners.history.off();  _profileListeners.history  = null; }
        }

        /**
         * Tampilkan toast peringatan akun sedang online di device lain.
         * Toast menutup otomatis setelah 8 detik.
         */
        function showOnlineElsewhereNotification(device, nickname) {
            // Hapus notifikasi lama jika ada
            const old = document.getElementById('online-elsewhere-notif');
            if (old) old.remove();

            const notif = document.createElement('div');
            notif.id = 'online-elsewhere-notif';
            notif.style.cssText = `
                position:fixed; top:20px; left:50%; transform:translateX(-50%);
                background:linear-gradient(135deg,#ff6f00,#e53935);
                color:white; padding:14px 22px; border-radius:14px;
                box-shadow:0 6px 24px rgba(0,0,0,0.45); z-index:99999;
                font-size:0.95em; text-align:center; max-width:340px; width:90%;
                animation:slideInRight 0.4s ease;
            `;
            notif.innerHTML = `
                <div style="font-size:1.3em; margin-bottom:4px;">⚠️ Akun Aktif di Tempat Lain</div>
                <div style="font-weight:normal; opacity:0.92; font-size:0.88em;">
                    <b>${escHtml(nickname)}</b> terdeteksi sedang online di <b>${escHtml(device)}</b>.<br>
                    Sesi lama akan digantikan oleh login ini.
                </div>
                <button onclick="playSound('button');document.getElementById('online-elsewhere-notif').remove()"
                    style="margin-top:10px; padding:5px 18px; background:rgba(255,255,255,0.25);
                           border:1px solid rgba(255,255,255,0.5); border-radius:8px;
                           color:white; cursor:pointer; font-size:0.85em;">
                    OK, Mengerti
                </button>
            `;
            document.body.appendChild(notif);

            // Auto-tutup setelah 8 detik
            setTimeout(() => {
                if (notif.parentElement) {
                    notif.style.animation = 'slideOutRight 0.4s ease forwards';
                    setTimeout(() => notif.remove(), 400);
                }
            }, 8000);
        }

        function showChangePasswordModal() {
            document.getElementById('cp-old-pass').value = '';
            document.getElementById('cp-new-pass').value = '';
            document.getElementById('cp-confirm-pass').value = '';
            document.getElementById('cp-msg').textContent = '';
            document.getElementById('change-password-modal').classList.add('active');
        }

        function hideChangePasswordModal() {
            document.getElementById('change-password-modal').classList.remove('active');
        }

        async function doChangePassword() {
            const oldPass    = document.getElementById('cp-old-pass').value.trim();
            const newPass    = document.getElementById('cp-new-pass').value.trim();
            const confirmPass = document.getElementById('cp-confirm-pass').value.trim();
            const msgEl      = document.getElementById('cp-msg');

            msgEl.style.color = '#f39c12';
            msgEl.textContent = '';

            if (!oldPass || !newPass || !confirmPass) {
                msgEl.style.color = '#e74c3c';
                msgEl.textContent = '⚠️ Semua kolom wajib diisi.';
                return;
            }
            if (newPass.length < 6) {
                msgEl.style.color = '#e74c3c';
                msgEl.textContent = '⚠️ Kata sandi baru minimal 6 karakter.';
                return;
            }
            if (newPass !== confirmPass) {
                msgEl.style.color = '#e74c3c';
                msgEl.textContent = '⚠️ Konfirmasi kata sandi tidak cocok.';
                return;
            }

            msgEl.textContent = '⏳ Memproses...';

            try {
                const user = firebase.auth().currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPass);

                // Bersihkan input setelah berhasil
                document.getElementById('cp-old-pass').value = '';
                document.getElementById('cp-new-pass').value = '';
                document.getElementById('cp-confirm-pass').value = '';

                msgEl.style.color = '#2ecc71';
                msgEl.textContent = '✅ Kata sandi berhasil diganti!';
                setTimeout(() => hideChangePasswordModal(), 1500);
            } catch (err) {
                msgEl.style.color = '#e74c3c';
                if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    msgEl.textContent = '❌ Kata sandi lama salah.';
                } else if (err.code === 'auth/too-many-requests') {
                    msgEl.textContent = '❌ Terlalu banyak percobaan. Coba lagi nanti.';
                } else {
                    msgEl.textContent = '❌ Gagal: ' + err.message;
                }
            }
        }

        function confirmLogout() {
            if (confirm('🚪 Yakin ingin logout?\n\n⚠️ Jika sedang dalam pertandingan, aksi akan dijalankan otomatis sampai game selesai.')) {
                doLogout();
            }
        }

        async function doLogout() {
            stopClientKeepAlive();

            // Kirim auto mode ke server jika sedang bermain
            if (ws && currentRoomId) {
                try { ws.send(JSON.stringify({ type: 'SET_AUTO_MODE', roomId: currentRoomId, enabled: true })); } catch(e) {}
            }

            // Tutup WebSocket dengan bersih (null handler dulu agar tidak trigger reconnect)
            if (ws) {
                ws.onclose = null;
                ws.onerror = null;
                ws.onmessage = null;
                try { ws.close(); } catch(e) {}
                ws = null;
            }

            // Hapus presence dari Firebase sebelum signOut
            clearPresence();

            await auth.signOut();

            // Jangan hapus ROOM_ID dan PLAYER_ID agar bisa reconnect nanti jika ada sesi
            lsDel(LS.USER_UID);
            lsDel(LS.USER_EMAIL);
            lsDel(LS.NICKNAME);

            // Reset variabel game
            currentRoomId = null;
            myPlayerId = null;
            gameState = null;
            deckInitialized = false;
            reconnectAttempts = 0;
            _isCustomRoom = false;
            _isSpectator = false;

            // Bersihkan custom room state & listener
            if (_customInviteRef) { _customInviteRef.off(); _customInviteRef = null; }
            _customInviteData = null;
            _customRoomId = null;
            _customRoomRole = null;
            _customRoomSlots = [];
            _customPickerSlot = null;
            _pendingCustomJoin = false;

            // Bersihkan party state & listener
            if (_partyStatusRef)       { _partyStatusRef.off();       _partyStatusRef = null; }
            if (_partyStatus2Ref)      { _partyStatus2Ref.off();      _partyStatus2Ref = null; }
            if (_partyInviteRef)       { _partyInviteRef.off();       _partyInviteRef = null; }
            if (_partyRosterRef)       { _partyRosterRef.off();       _partyRosterRef = null; }
            if (_partyKickRef)         { _partyKickRef.off();         _partyKickRef = null; }
            if (_partyGuestRosterRef)  { _partyGuestRosterRef.off();  _partyGuestRosterRef = null; }
            if (_guestPartyStatusRef)  { _guestPartyStatusRef.off();  _guestPartyStatusRef = null; }
            // Bersihkan listener partyCancelSearch dan hapus node-nya dari Firebase
            if (currentUser) {
                const _csRef = db.ref(`users/${currentUser.uid}/partyCancelSearch`);
                _csRef.off();
                _csRef.remove().catch(() => {});
            }
            _partyInviteData = null;
            _partyFriendUid = null;
            _partyFriendName = null;
            _partyFriend2Uid = null;
            _partyFriend2Name = null;
            _partyId = null;
            _partyQueueSize = null;
            _isPartyGuest = false;
            _partyHostUid = null;
            _partyHostName = null;
            _myPartySlot = 2;
            _guestSlot3Uid = null;
            _openPickerSlot = null;

            // Reset form login agar tidak auto-isi dari sesi lama
            const loginEmail = document.getElementById('login-email');
            const loginPass  = document.getElementById('login-password');
            if (loginEmail) loginEmail.value = '';
            if (loginPass)  loginPass.value  = '';

            document.getElementById('game-container').classList.remove('active');
            document.getElementById('pre-loading-screen').style.display = 'none';
            // showAuthScreen() akan dipanggil otomatis oleh onAuthStateChanged(null)
        }

        // =============================================
        // RECONNECT BANNER
        // =============================================
        function showReconnectBanner() {
            // Tidak dipakai lagi - reconnect sekarang otomatis
            showPreloadingScreen();
        }

        function reconnectToGame(roomId, playerId) {
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                addLog('❌ Gagal reconnect setelah 3 percobaan. Kembali ke menu.');
                lsDel(LS.ROOM_ID); lsDel(LS.PLAYER_ID); lsDel(LS.IS_SPECTATOR); lsDel(LS.GAME_ACTIVE);
                reconnectAttempts = 0;
                showPreloadingScreen(false);
                showHomeButtons();
                document.getElementById('profile-badge').style.display = 'block';
                return;
            }

            reconnectAttempts++;
            stopPingMeasurement();

            if (ws) {
                // Hapus handler dulu agar onclose lama tidak trigger reconnect lagi
                ws.onclose = null; ws.onerror = null; ws.onmessage = null;
                try { ws.close(); } catch(e) {}
                ws = null;
            }

            // Tampilkan preloading screen dengan status reconnect (BUKAN game container dulu)
            // agar tidak ada flash layar game saat reconnect gagal (room sudah selesai)
            document.getElementById('matchmaking-screen').classList.remove('active');
            document.getElementById('profile-badge').style.display = 'none';
            document.getElementById('game-container').classList.remove('active');
            const _preScreen = document.getElementById('pre-loading-screen');
            _preScreen.style.display = 'flex';
            _preScreen.classList.remove('hidden');
            const _infoEl = document.getElementById('pre-loading-info');
            if (_infoEl) { _infoEl.style.display = 'block'; _infoEl.textContent = `🔄 Menyambung kembali... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`; }
            const _spinnerEl = document.getElementById('pre-loading-spinner');
            if (_spinnerEl) _spinnerEl.style.display = 'block';
            const _subtitleEl = document.querySelector('.pre-loading-subtitle');
            if (_subtitleEl) _subtitleEl.style.display = 'none';
            const _playBtnEl = document.getElementById('btn-play');
            if (_playBtnEl) _playBtnEl.style.display = 'none';
            
            ws = new WebSocket(SERVER_URL);

            ws.onopen = () => {
                startClientKeepAlive();
                ws.send(JSON.stringify({
                    type: 'REJOIN_ROOM',
                    roomId: roomId,
                    playerId: playerId,
                    playerName: currentNickname || lsGet(LS.NICKNAME) || 'Player',
                    userUid: currentUser ? currentUser.uid : (lsGet(LS.USER_UID) || '')
                }));
            };

            let reconnected = { value: false };

            ws.onmessage = (event) => {
                let data;
                try { data = JSON.parse(event.data); } catch(e) { return; }
                if (data.type === 'GAME_STATE_UPDATE' || data.type === 'GAME_STARTED') {
                    reconnected.value = true;
                    reconnectAttempts = 0; // reset karena berhasil
                    currentRoomId = roomId;
                    myPlayerId = playerId;
                    // Restore custom room / spectator flags dari respons server
                    _isCustomRoom = !!data.isCustomRoom;
                    _isSpectator  = !!data.isSpectator;
                    // Setup UI sesuai mode
                    const _spBannerR = document.getElementById('spectator-banner');
                    if (_spBannerR) _spBannerR.style.display = _isSpectator ? 'block' : 'none';
                    const _btnSurrR = document.getElementById('btn-surrender');
                    if (_btnSurrR) {
                        if (_isSpectator) { _btnSurrR.style.display = 'none'; }
                        else { _btnSurrR.style.display = ''; _btnSurrR.disabled = false; }
                    }
                    // Baru tampilkan game container setelah reconnect berhasil dikonfirmasi server
                    document.getElementById('pre-loading-screen').style.display = 'none';
                    DOM.gameContainer.classList.add('active');
                    updateGameUI(data.state);
                    addLog('✅ Berhasil tersambung kembali!');
                    ws.send(JSON.stringify({ type: 'PLAYER_ACTIVE', roomId: currentRoomId }));
                    // Putar bgMusic2 saat reconnect berhasil
                    try {
                        soundEffects.bgMusic.pause();
                        soundEffects.bgMusic2.currentTime = 0;
                        soundEffects.bgMusic2.play().catch(() => {
                            // Autoplay diblokir browser, tunggu interaksi pertama user
                            // Hapus listener lama dulu agar tidak akumulasi saat reconnect berulang
                            if (window._bgMusic2FirstClickHandler) {
                                document.removeEventListener('click', window._bgMusic2FirstClickHandler);
                            }
                            window._bgMusic2FirstClickHandler = function() {
                                soundEffects.bgMusic2.play().catch(() => {});
                                document.removeEventListener('click', window._bgMusic2FirstClickHandler);
                                window._bgMusic2FirstClickHandler = null;
                            };
                            document.addEventListener('click', window._bgMusic2FirstClickHandler);
                        });
                    } catch(e) {}
                    // Pindah ke onmessage normal
                    ws.onmessage = (ev) => { try { handleServerMessage(JSON.parse(ev.data)); } catch(e) {} };
                } else if (data.type === 'ERROR') {
                    // Room sudah tidak ada (game selesai) — hentikan semua retry dan kembali ke home
                    lsDel(LS.ROOM_ID); lsDel(LS.PLAYER_ID); lsDel(LS.IS_SPECTATOR); lsDel(LS.GAME_ACTIVE);
                    reconnected.value = true;              // Cegah branch pertama onclose memicu retry
                    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Cegah branch kedua onclose memicu retry
                    currentRoomId = null;
                    myPlayerId = null;
                    document.getElementById('game-container').classList.remove('active');
                    showPreloadingScreen(false);
                    showHomeButtons();
                    document.getElementById('profile-badge').style.display = 'block';
                } else if (data.type === 'GAME_OVER') {
                    // Game sudah selesai saat reconnect — sembunyikan pre-loading screen dulu baru tampilkan hasil
                    reconnected.value = true;
                    reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
                    const _ps = document.getElementById('pre-loading-screen');
                    _ps.classList.add('hidden');
                    setTimeout(() => { _ps.style.display = 'none'; }, 500);
                    ws.onmessage = (ev) => { try { handleServerMessage(JSON.parse(ev.data)); } catch(e) {} };
                    if (data.players) endGame(data.players);
                } else {
                    // Pesan lain (misal LOG) tiba sebelum GAME_STATE_UPDATE.
                    // Jangan set currentRoomId dulu — tunggu konfirmasi GAME_STATE_UPDATE
                    // agar party invite tidak salah dianggap sedang dalam pertandingan
                    handleServerMessage(data);
                }
            };

            ws.onerror = () => {
                addLog('⚠️ Koneksi gagal, mencoba lagi...');
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => reconnectToGame(roomId, playerId), 3000);
            };

            ws.onclose = (e) => {
                stopClientKeepAlive();
                if (!reconnected.value && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    if (reconnectTimer) clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(() => reconnectToGame(roomId, playerId), 3000);
                } else if (reconnected.value) {
                    // Sudah berhasil reconnect sebelumnya tapi disconnect lagi — coba reconnect ulang
                    reconnected.value = false;
                    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        addLog('🔄 Koneksi terputus lagi, mencoba sambung kembali...');
                        if (reconnectTimer) clearTimeout(reconnectTimer);
                        reconnectTimer = setTimeout(() => reconnectToGame(roomId, playerId), 3000);
                    } else {
                        sendAutoMode(true);
                    }
                }
            };
        }

        // =============================================
        // RECONNECT SEBAGAI SPECTATOR
        // =============================================
        function reconnectAsSpectator(roomId) {
            const _preScreen = document.getElementById('pre-loading-screen');
            _preScreen.style.display = 'flex';
            _preScreen.classList.remove('hidden');
            const _infoEl = document.getElementById('pre-loading-info');
            if (_infoEl) { _infoEl.style.display = 'block'; _infoEl.textContent = '🔄 Menyambung kembali sebagai penonton...'; }

            if (ws) {
                ws.onclose = null; ws.onerror = null; ws.onmessage = null;
                try { ws.close(); } catch(e) {}
                ws = null;
            }

            ws = new WebSocket(SERVER_URL);
            const spectatorReconnected = { value: false };

            ws.onopen = () => {
                startClientKeepAlive();
                ws.send(JSON.stringify({
                    type: 'REJOIN_AS_SPECTATOR',
                    roomId,
                    userUid: currentUser ? currentUser.uid : (lsGet(LS.USER_UID) || '')
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'GAME_STARTED' && data.isSpectator) {
                        spectatorReconnected.value = true;
                        currentRoomId  = roomId;
                        myPlayerId     = null;
                        _isSpectator   = true;
                        _isCustomRoom  = true;
                        const spBanner = document.getElementById('spectator-banner');
                        if (spBanner) spBanner.style.display = 'block';
                        const btnSurr = document.getElementById('btn-surrender');
                        if (btnSurr) btnSurr.style.display = 'none';
                        document.getElementById('pre-loading-screen').style.display = 'none';
                        DOM.gameContainer.classList.add('active');
                        updateGameUI(data.state);
                        addLog('✅ Berhasil tersambung kembali sebagai penonton!');
                        ws.onmessage = (ev) => { try { handleServerMessage(JSON.parse(ev.data)); } catch(e) {} };
                    } else if (data.type === 'ERROR') {
                        spectatorReconnected.value = true;
                        lsDel(LS.ROOM_ID); lsDel(LS.IS_SPECTATOR); lsDel(LS.GAME_ACTIVE);
                        document.getElementById('game-container').classList.remove('active');
                        showPreloadingScreen(false);
                        showHomeButtons();
                        document.getElementById('profile-badge').style.display = 'block';
                    }
                } catch(e) {}
            };

            ws.onerror = () => {
                stopClientKeepAlive();
                lsDel(LS.ROOM_ID); lsDel(LS.IS_SPECTATOR); lsDel(LS.GAME_ACTIVE);
                showPreloadingScreen(false);
                showHomeButtons();
            };

            ws.onclose = () => {
                stopClientKeepAlive();
                if (!spectatorReconnected.value) {
                    lsDel(LS.ROOM_ID); lsDel(LS.IS_SPECTATOR); lsDel(LS.GAME_ACTIVE);
                    showPreloadingScreen(false);
                    showHomeButtons();
                }
            };
        }

        // =============================================
        // PRELOADING SCREEN (hanya tampil setelah login)
        // =============================================
        function showPreloadingScreen(withLoading = true) {
            document.getElementById('pre-loading-screen').style.display = 'flex';
            document.getElementById('pre-loading-screen').classList.remove('hidden');
            if (withLoading) startPreLoading();
        }

        // =============================================
        // AUTO MODE CLIENT-SIDE
        // =============================================
        let isAutoMode = false;
        let autoModeTimer = null;
        const AUTO_MODE_DELAY = 25000; // 25 detik sebelum auto mode aktif

        function sendAutoMode(enabled) {
            if (ws && currentRoomId) {
                try {
                    ws.send(JSON.stringify({ type: 'SET_AUTO_MODE', roomId: currentRoomId, enabled }));
                } catch(e) {}
            }
            isAutoMode = enabled;
            document.getElementById('auto-mode-indicator').style.display = enabled ? 'block' : 'none';
        }

        function startAutoModeTimer() {
            stopAutoModeTimer();
            autoModeTimer = setTimeout(() => {
                if (!document.hidden && document.hasFocus()) return; // Masih aktif
                sendAutoMode(true);
            }, AUTO_MODE_DELAY);
        }

        function stopAutoModeTimer() {
            if (autoModeTimer) { clearTimeout(autoModeTimer); autoModeTimer = null; }
        }

        // Event: Tab/window tidak aktif
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (currentRoomId) startAutoModeTimer();
            } else {
                stopAutoModeTimer();
                // Reset auto mode jika aktif
                if (isAutoMode && currentRoomId && ws) {
                    sendAutoMode(false);
                    ws.send(JSON.stringify({ type: 'PLAYER_ACTIVE', roomId: currentRoomId }));
                }
                // Restore force pick interaction jika perlu
                if (gameState && myPlayerId) {
                    const player = gameState.players.find(p => p.id === myPlayerId);
                    if (player && gameState.forcePickMode && 
                        gameState.forcePickPlayers.some(p => p.id === player.id) && 
                        !player.hasPlayed) {
                        player.isProcessingAction = false;
                        forcePickClickDebounce = false;
                        setTimeout(() => enableForcePickInteraction(), 300);
                    }
                }
            }
        });

        // Event: Window blur (pindah tab/app)
        window.addEventListener('blur', () => {
            if (currentRoomId) startAutoModeTimer();
        });

        window.addEventListener('focus', () => {
            stopAutoModeTimer();
            if (isAutoMode && currentRoomId && ws) {
                sendAutoMode(false);
                ws.send(JSON.stringify({ type: 'PLAYER_ACTIVE', roomId: currentRoomId }));
            }
        });

        // Event: Sebelum tutup browser/tab
        window.addEventListener('beforeunload', () => {
            if (currentRoomId) {
                if (!_isSpectator) {
                    sendAutoMode(true);
                    lsSet(LS.ROOM_ID, currentRoomId);
                    lsSet(LS.PLAYER_ID, myPlayerId);
                    lsSet(LS.GAME_ACTIVE, 'true');
                    lsDel(LS.IS_SPECTATOR);
                } else {
                    lsSet(LS.ROOM_ID, currentRoomId);
                    lsSet(LS.IS_SPECTATOR, 'true');
                    lsSet(LS.GAME_ACTIVE, 'true');
                    lsDel(LS.PLAYER_ID);
                }
            }
            // Cleanup party lobby saat halaman ditutup/refresh
            if (_partyId && currentUser) {
                if (_isPartyGuest) {
                    // Tamu keluar → hapus dari roster & beritahu host
                    db.ref(`partyRoster/${_partyId}/${currentUser.uid}`).remove();
                    if (_partyHostUid) {
                        db.ref(`users/${_partyHostUid}/partyStatus/${_partyId}/${currentUser.uid}`).remove();
                    }
                } else {
                    // Host keluar → bubarkan semua
                    db.ref(`partyRoster/${_partyId}`).remove();
                    db.ref(`users/${currentUser.uid}/partyStatus`).remove();
                    if (_partyFriendUid)  db.ref(`users/${_partyFriendUid}/partyKick`).set({ disbanded: true });
                    if (_partyFriend2Uid) db.ref(`users/${_partyFriend2Uid}/partyKick`).set({ disbanded: true });
                    if (_partyFriendUid)  db.ref(`users/${_partyFriendUid}/partyInvite`).remove();
                    if (_partyFriend2Uid) db.ref(`users/${_partyFriend2Uid}/partyInvite`).remove();
                }
            }
            // Cleanup custom room invite yang masih pending saat halaman ditutup/refresh
            if (currentUser) {
                if (_customRoomSlots && _customRoomSlots.length > 0) {
                    _customRoomSlots.forEach(s => {
                        if (s?.pending && s.uid) db.ref(`users/${s.uid}/customRoomInvite`).remove();
                    });
                }
                if (_customInviteData) {
                    db.ref(`users/${currentUser.uid}/customRoomInvite`).remove();
                }
            }
        });

        // Setiap interaksi user di area game → matikan auto mode
        document.addEventListener('click', () => {
            if (isAutoMode && currentRoomId && ws) {
                sendAutoMode(false);
                ws.send(JSON.stringify({ type: 'PLAYER_ACTIVE', roomId: currentRoomId }));
            }
            stopAutoModeTimer();
        });

        // =============================================
        // CARD IMAGES — menggunakan file lokal
        // Path: gambar/provinsi/(nama provinsi)/(nama kartu).png
        // =============================================

        // =============================================
        // DATA PROVINSI
        // =============================================
        const provinces = [
            { name: "Aceh", cards: [
                { name: "Kopi Gayo",                  type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Masjid Raya Baiturrahman",   type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertanian Kopi",             type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumoh Aceh",                 type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Rencong",                    type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Ulee Balang",                type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Serune Kalee",               type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Saman",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Peusijuek",                  type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Mie Aceh",                   type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sumatera Utara", cards: [
                { name: "Karet & Kelapa Sawit",       type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Istana Maimun",              type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Sawit",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Bolon",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Piso Gaja Dompak",           type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Ulos",                       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gondang Sabangunan",         type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Tor-Tor",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Mangulosi",                  type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Bika Ambon",                 type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sumatera Barat", cards: [
                { name: "Gambir & Kulit Manis",       type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Jam Gadang",                 type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perdagangan Rempah",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Gadang",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Karih",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Bundo Kanduang",             type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Saluang",                    type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Piring",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Batagak Penghulu",           type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Rendang",                    type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Riau", cards: [
                { name: "Minyak Bumi",                type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Istana Siak",                type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Minyak",        type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Selaso Jatuh Kembar",  type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pedang Jenawi",              type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Teluk Belanga",              type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gambus",                     type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Zapin",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Tepuk Tepung Tawar",         type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Gulai Belacan",              type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kepulauan Riau", cards: [
                { name: "Bauksit & Timah",            type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Fort de Kock",       type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perikanan Laut",             type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Belah Bubung",         type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Badik Tumbuk Lada",          type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kebaya Labuh",               type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gong",                       type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Tandak",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Mandi Safar",                type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Otak-otak",                  type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Jambi", cards: [
                { name: "Batubara & Karet",           type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Candi Muaro Jambi",          type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Karet",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Kajang Leko",          type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Siginjai",             type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Baju Kurung Tanggung",       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Kelintang",                  type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Sekapur Sirih",         type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Betangas",                   type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Tempoyak",                   type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Bengkulu", cards: [
                { name: "Batubara & Emas",            type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Marlborough",        type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Batu Bara",     type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Bubungan Lima",        type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Rudus",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pakaian Rejang Lebong",      type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Dol",                        type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Andun",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Bimbang Adat",               type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Pendap",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sumatera Selatan", cards: [
                { name: "Minyak & Gas Bumi",          type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Jembatan Ampera",            type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Minyak",        type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Limas",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Tombak Trisula",             type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Aesan Gede",                 type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Accordion Palembang",        type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Tanggai",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Nganggung",                  type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Pempek",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Bangka Belitung", cards: [
                { name: "Timah",                      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Kuto Panji",         type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Timah",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Rakit",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Siwar",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pakaian Seting",             type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Dambus",                     type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Sepen",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Buang Jong",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Lempah Kuning",              type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Lampung", cards: [
                { name: "Kopi Robusta Lampung",       type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Menara Siger",               type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Kopi",            type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Nuwou Sesat",          type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Terapang",                   type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pakaian Tulang Bawang",      type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gamolan Pekhing",            type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Sigeh Penguten",        type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Cangget",                    type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Seruit",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "DKI Jakarta", cards: [
                { name: "Industri & Perdagangan",     type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Kota Tua Jakarta",           type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perdagangan & Jasa",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Kebaya",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Golok",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kebaya Encim",               type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tehyan",                     type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Yapong",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Palang Pintu",               type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Kerak Telor",                type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Jawa Barat", cards: [
                { name: "Teh & Kina",                 type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Keraton Kasepuhan Cirebon",  type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Teh",             type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Kasepuhan",            type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Kujang",                     type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kebaya Sunda",               type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Angklung",                   type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Jaipong",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Seren Taun",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Seblak",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Banten", cards: [
                { name: "Baja & Industri",            type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Masjid Agung Banten",        type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Industri Baja",              type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Baduy",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Golok Ciomas",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pakaian Pangsi",             type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Dogdog Lojor",               type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Cokek",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Seba Baduy",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Sate Bandeng",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Jawa Tengah", cards: [
                { name: "Batik & Tekstil",            type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Candi Borobudur",            type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Industri Tekstil",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Joglo",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kebaya Jawa",                type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gamelan",                    type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Serimpi",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Sekaten",                    type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Lumpia",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "DI Yogyakarta", cards: [
                { name: "Batik Yogyakarta",           type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Keraton Yogyakarta",         type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Industri Kerajinan",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Bangsal Kencono",            type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Yogyakarta",           type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kebaya Kesatrian",           type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gamelan Yogyakarta",         type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Kumbang",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Labuhan Merapi",             type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Gudeg",                      type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Jawa Timur", cards: [
                { name: "Garam & Tembakau",           type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Candi Penataran",            type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Industri Garam",             type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Situbondo",            type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Clurit",                     type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pesa'an",                    type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Saronen",                    type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Remo",                  type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Karapan Sapi",               type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Rujak Cingur",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Bali", cards: [
                { name: "Kopi Kintamani",             type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Pura Besakih",               type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pariwisata Budaya",          type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Gapura Candi Bentar",  type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Bali",                 type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Payas Agung",                type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Gamelan Bali",               type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Pendet",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Ngaben",                     type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Ayam Betutu",                type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Nusa Tenggara Barat", cards: [
                { name: "Mutiara Lombok",             type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Istana Dalam Loka",          type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Budidaya Mutiara",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Dalam Loka",           type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris NTB",                  type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Lambung",                    type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Serunai NTB",                type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Gandrung",              type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Bau Nyale",                  type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Ayam Taliwang",              type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Nusa Tenggara Timur", cards: [
                { name: "Kopi Flores & Cendana",      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Portugis Solor",     type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Peternakan Sapi",            type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Musalaki",             type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Sundu",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pakaian Amarasi",            type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Sasando",                    type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Caci",                  type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Pati Ka",                    type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Se'i",                       type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kalimantan Barat", cards: [
                { name: "Bauksit & Emas",             type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Keraton Kadriyah Pontianak", type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Bauksit",       type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Panjang",              type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Mandau",                     type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "King Baba",                  type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Sape",                       type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Monong",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Naik Dango",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Bubur Pedas",                type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kalimantan Tengah", cards: [
                { name: "Rotan & Kayu Ulin",          type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Istana Kuning Sampit",       type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Kehutanan & Rotan",          type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Betang",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Mandau Kalteng",             type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Sangkarut",                  type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Garantung",                  type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Giring-giring",         type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Tiwah",                      type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Juhu Singkah",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kalimantan Selatan", cards: [
                { name: "Intan & Batubara",           type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Masjid Sultan Suriansyah",   type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Intan",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Bubungan Tinggi",      type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Banjar",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Babaju Kun Galung",          type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Panting",                    type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Baksa Kembang",         type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Aruh Ganal",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Soto Banjar",                type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kalimantan Timur", cards: [
                { name: "Minyak & Gas Kaltim",        type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Keraton Kutai Kartanegara",  type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Migas",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Lamin",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Mandau Kaltim",              type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Kustin",                     type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Sape Kaltim",                type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Gong",                  type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Erau",                       type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Nasi Kuning",                type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Kalimantan Utara", cards: [
                { name: "Gas Alam & Kelapa Sawit",    type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Tarakan",            type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perikanan & Kehutanan",      type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Baloy",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Mandau Kalut",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Ta'a",                       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Sampe",                      type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Jepen",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Iraw Tengkayu",              type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Kepiting Soka",              type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sulawesi Utara", cards: [
                { name: "Kelapa & Cengkeh",           type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Moraya",             type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perikanan Laut",             type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Walewangko",           type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Sulut",                type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Laku Tepu",                  type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Kolintang",                  type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Maengket",              type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Tulude",                     type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Bubur Manado",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Gorontalo", cards: [
                { name: "Jagung & Ikan Tuna",         type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Otanaha",            type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertanian Jagung",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Dulohupa",             type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Wamilo",                     type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Biliu",                      type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Polopalo",                   type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Polopalo",              type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Molonthalo",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Binte Biluhuta",             type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sulawesi Tengah", cards: [
                { name: "Nikel & Emas Sulteng",       type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Masjid Tua Luwuk",           type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Nikel",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Tambi",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pasatimpo",                  type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Koje",                       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Ganda",                      type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Lumense",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Balia",                      type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Kaledo",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sulawesi Barat", cards: [
                { name: "Kakao & Kelapa Sulbar",      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Istana Malaweg",             type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Kakao",           type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Boyang",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Badik Sulbar",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pattuqduq Towaine",          type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Kecapi Sulbar",              type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Patuddu",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Sayyang Pattu'du",           type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Bau Peapi",                  type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sulawesi Selatan", cards: [
                { name: "Nikel & Besi Sulsel",        type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Rotterdam",          type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Nikel",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Tongkonan",            type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Badik",                      type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Baju Bodo",                  type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Kecapi Sulsel",              type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Kipas Pakarena",        type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Rambu Solo",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Coto Makassar",              type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Sulawesi Tenggara", cards: [
                { name: "Nikel & Aspal Buton",        type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Keraton Buton",      type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Aspal",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Istana Buton",         type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Keris Sultra",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Babu Nggawi",                type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Ladolado",                   type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Lulo",                  type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Posuo",                      type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Lapa-lapa",                  type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Maluku", cards: [
                { name: "Pala & Cengkeh Maluku",      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Belgica Banda",      type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perkebunan Rempah",          type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Baileo",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Parang Salawaku",            type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Baju Cele",                  type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa",                       type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Cakalele",              type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Pukul Sapu",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Papeda",                     type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Maluku Utara", cards: [
                { name: "Nikel & Cengkeh Malut",      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng Tolukko Ternate",    type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Nikel",         type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Sasadu",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Parang Malut",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Manteren Lamo",              type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Malut",                 type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Lenso",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Kololi Kie",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Gohu Ikan",                  type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua", cards: [
                { name: "Emas & Tembaga Freeport",    type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Tugu MacArthur Jayapura",    type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertambangan Emas",          type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Honai",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Belati Papua",         type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Koteka",                     type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Papua",                 type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Musyoh",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Bakar Batu",                 type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Papeda Papua",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua Barat", cards: [
                { name: "Gas Alam & Ikan Laut",       type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Tugu Jepang Manokwari",      type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perikanan & Migas",          type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Mod Aki Aksa",         type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Pabar",                type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Ewer",                       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Pabar",                 type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Suanggi",               type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Wor",                        type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Ikan Bakar Manokwari",       type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua Selatan", cards: [
                { name: "Kayu & Hasil Hutan",         type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Situs Megalitik Okaba",      type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Kehutanan",                  type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Gotad",                type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Pasel",                type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Pummi",                      type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Pasel",                 type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Gatzi",                 type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Yi Ha",                      type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Sagu Sep",                   type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua Tengah", cards: [
                { name: "Emas & Hasil Hutan Pateng",  type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Situs Prasejarah Lembah Baliem", type: "Bangunan Bersejarah", rarity: "legendary", power: 9 },
                { name: "Pertanian & Kehutanan",      type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Karapao",              type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Pateng",               type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Sali",                       type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Pateng",                type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Yuw",                   type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Bakar Batu Pateng",          type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Sagu Bakar",                 type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua Pegunungan", cards: [
                { name: "Hasil Hutan & Kopi",         type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Monumen Yalimo",             type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Pertanian Pegunungan",       type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Honai Pegunungan",     type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Peg",                  type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Yokal",                      type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Pikon",                      type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Selamat Datang",        type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Festival Lembah Baliem",     type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Udang Selingkuh",            type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]},
            { name: "Papua Barat Daya", cards: [
                { name: "Ikan & Mutiara Sorong",      type: "SDA Unggulan",        rarity: "mythic",      power: 10 },
                { name: "Benteng VOC Sorong",         type: "Bangunan Bersejarah", rarity: "legendary",   power: 9 },
                { name: "Perikanan & Pariwisata",     type: "Sektor Ekonomi",      rarity: "rareplus",    power: 7 },
                { name: "Rumah Kambik",               type: "Rumah Adat",          rarity: "epic",        power: 8 },
                { name: "Pisau Pabarday",             type: "Senjata Tradisional", rarity: "rarestar",    power: 6 },
                { name: "Boe",                        type: "Pakaian Adat",        rarity: "rare",        power: 5 },
                { name: "Tifa Pabarday",              type: "Alat Musik",          rarity: "uncommon",    power: 4 },
                { name: "Tari Aluyen",                type: "Tarian",              rarity: "uncommonplus",power: 3 },
                { name: "Injak Piring",               type: "Adat Istiadat",       rarity: "commonplus",  power: 2 },
                { name: "Udang Karang",               type: "Makanan Khas",        rarity: "common",      power: 1 },
            ]}
        ];

        // =============================================
        // SOUND EFFECTS
        // =============================================
        const soundEffects = {
            zoomIn:    new Audio(av('sounds/zoom_in.mp3')),
            zoomOut:   new Audio(av('sounds/zoom_out.mp3')),
            forcePick: new Audio(av('sounds/force_pick.mp3')),
            drawCard:  new Audio(av('sounds/draw_card.mp3')),
            x:         new Audio(av('sounds/x.mp3')),
            button:    new Audio(av('sounds/button.mp3')),
            bgMusic:   new Audio(av('sounds/bg_music.mp3')),
            bgMusic2:  new Audio(av('sounds/bg_music2.mp3')),
            invite:    new Audio(av('sounds/Invite.mp3'))
        };

        soundEffects.bgMusic.loop = true;
        soundEffects.bgMusic.volume = 0.3;
        soundEffects.bgMusic2.loop = true;
        soundEffects.bgMusic2.volume = 0.3;
        soundEffects.zoomIn.volume = 0.5;
        soundEffects.zoomOut.volume = 0.5;
        soundEffects.forcePick.volume = 0.6;
        soundEffects.drawCard.volume = 0.5;

        Object.values(soundEffects).forEach(s => s.load());

        let audioUnlocked = false;
        document.addEventListener('click', function unlockAudio() {
            if (!audioUnlocked) {
                Object.values(soundEffects).forEach(s => {
                    if (s === soundEffects.bgMusic || s === soundEffects.bgMusic2) return;
                    s.play().then(() => { s.pause(); s.currentTime = 0; }).catch(() => {});
                });
                audioUnlocked = true;
            }
        }, { once: true });

        function playSound(soundType) {
            try {
                const s = soundEffects[soundType];
                if (s) {
                    s.currentTime = 0;
                    const p = s.play();
                    if (p) p.catch(() => {});
                }
            } catch(e) {}
        }

        function ensureBgMusic2() {
            try {
                if (soundEffects.bgMusic2.paused) {
                    soundEffects.bgMusic.pause();
                    soundEffects.bgMusic2.play().catch(() => {});
                }
            } catch(e) {}
        }

        // =============================================
        // WEBSOCKET & GAME STATE
        // =============================================
        const SERVER_URL = "wss://server-card-game-nusantara-production-dc82.up.railway.app";

        let ws = null;
        let currentRoomId = null;
        let myPlayerId = null;
        let gameState = null;
        let _partyQueueSize = null; // jumlah anggota party (2 atau 3), dikirim bersama JOIN_MATCHMAKING

        let forcePickClickDebounce = false;
        let forcePickHeartbeat = null;
        let autoForcePickTimer = null;
        let refreshButtonTimer = null;
        let _pingInterval = null;
        let _pingTs = 0;

        let reconnectAttempts = 0;
        let reconnectTimer = null;
        const MAX_RECONNECT_ATTEMPTS = 3;
        let clientKeepAliveInterval = null;
        let deckInitialized = false;

        // Nama bot langsung dari server (sudah konsisten, tidak berubah saat refresh)
        const botNameMap = {}; // tetap ada agar referensi lain tidak error

        function getBotDisplayName(player) {
            return player.name;
        }

        const DOM = {
            matchmakingScreen: document.getElementById('matchmaking-screen'),
            gameContainer:     document.getElementById('game-container'),
            gameOverModal:     document.getElementById('game-over-modal'),
            rankings:          document.getElementById('rankings'),
        };

        // =============================================
        // PRE-LOADING
        // =============================================
        function startPreLoading() {
            const infoEl = document.getElementById('pre-loading-info');
            const spinnerEl = document.getElementById('pre-loading-spinner');
            const subtitleEl = document.querySelector('.pre-loading-subtitle');
            const playBtn = document.getElementById('btn-play');

            const steps = [
                "Memuat 190 kartu provinsi...",
                "Memuat gambar dan aset...",
                "Menyiapkan sound effects...",
                "Mempersiapkan sistem game...",
                "Validasi data kartu...",
                "Hampir selesai..."
            ];
            let i = 0;
            const iv = setInterval(() => {
                if (i < steps.length) {
                    infoEl.textContent = steps[i++];
                } else {
                    clearInterval(iv);
                    infoEl.style.display = 'none';
                    subtitleEl.style.display = 'none';
                    spinnerEl.style.display = 'none';
                    playBtn.style.display = 'block';
                }
            }, 800);
        }

        function goToMatchmaking() {
            // Try to start bg music on user gesture
            try {
                soundEffects.bgMusic.currentTime = 0;
                soundEffects.bgMusic.play().catch(() => {});
            } catch(e) {}

            const preScreen = document.getElementById('pre-loading-screen');
            preScreen.classList.add('hidden');
            setTimeout(() => {
                preScreen.style.display = 'none';
                document.getElementById('matchmaking-screen').classList.add('active');
                document.getElementById('profile-badge').style.display = 'block';
            }, 500);
        }

        // =============================================
        // MATCHMAKING
        // =============================================
        // Helper: restore overflow body sesuai kondisi (game aktif = auto, tidak = hidden)
        function restoreBodyOverflow() {
            const gameActive = document.getElementById('game-container')?.classList.contains('active');
            document.body.style.overflow = gameActive ? 'auto' : '';
        }

        // Tutup semua halaman/overlay yang mungkin sedang terbuka
        function closeAllScreens() {
            const ids = [
                'profile-screen',
                'settings-screen',
                'leaderboard-screen',
                'view-profile-modal',
                'ingame-settings-panel',
                'party-lobby-overlay',
                'party-invite-popup',
                'kostum-picker-overlay',
                'custom-room-overlay',
                'custom-room-invite-popup',
                'avatar-picker-overlay',
            ];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            // Sembunyikan bubble lobby juga
            const partyBubble = document.getElementById('party-lobby-bubble');
            const customBubble = document.getElementById('custom-lobby-bubble');
            if (partyBubble) partyBubble.style.display = 'none';
            if (customBubble) customBubble.style.display = 'none';
        }

        function startMatchmaking() {
            _setPresenceStatus('inQueue');
            // bgMusic tetap jalan saat mencari lawan, bgMusic2 akan diputar saat memasuki pertandingan
            // Tetap tampilkan matchmaking screen (agar tombol lain masih terlihat)
            // Sembunyikan hanya bagian waiting, tampilkan floating bar
            DOM.matchmakingScreen.classList.add('active');
            DOM.matchmakingScreen.querySelector('#matchmaking-idle').style.display = 'flex';
            DOM.matchmakingScreen.querySelector('#matchmaking-waiting').style.display = 'none';
            DOM.matchmakingScreen.style.justifyContent = 'flex-end';
            showMatchmakingFloatBar();
            startMatchmakingCountdown();

            ws = new WebSocket(SERVER_URL);

            ws.onopen = () => {
                startClientKeepAlive();
                const playerName = currentNickname || lsGet(LS.NICKNAME) || 'Player ' + Math.floor(Math.random() * 1000);

                // REJOIN_PARTY_LOBBY hanya untuk reconnect ke WS partyLobby yang sudah ada di server.
                // Tamu Firebase party (_isPartyGuest=true + _partyQueueSize set dari partySignal)
                // harus kirim JOIN_MATCHMAKING langsung — server tidak punya partyLobby Firebase di WS,
                // REJOIN akan dapat PARTY_NOT_FOUND dan tamu kembali ke lobi.
                //
                // Tamu reconnect WS: _isPartyGuest=true, _partyQueueSize=null (belum dapat PARTY_QUEUING lagi)
                // Host/solo: _isPartyGuest=false → JOIN_MATCHMAKING
                const isReconnectingWsGuest = _isPartyGuest && _partyQueueSize === null && (_partyFirebaseId || _partyId);

                if (isReconnectingWsGuest) {
                    ws.send(JSON.stringify({
                        type: 'REJOIN_PARTY_LOBBY',
                        userUid: currentUser ? currentUser.uid : '',
                        playerName: playerName
                    }));
                } else {
                    // Solo, host party Firebase, ATAU tamu Firebase (sudah punya _partyId + _partyQueueSize)
                    ws.send(JSON.stringify({
                        type: 'JOIN_MATCHMAKING',
                        playerName: playerName,
                        userUid: currentUser ? currentUser.uid : (lsGet(LS.USER_UID) || ''),
                        partyId: _partyId || undefined,
                        partySize: _partyQueueSize || undefined
                    }));
                }

                // FIX race condition: kirim partySignal ke tamu SETELAH host terhubung ke server.
                // Delay 600ms memberi waktu tamu memproses partyCancelSearch dan memasang ulang
                // _startPartySignalListener sebelum sinyal baru ditulis — menghindari sinyal terlewat.
                if (_pendingPartySignals) {
                    const { uids, partyId, partySize } = _pendingPartySignals;
                    _pendingPartySignals = null;
                    setTimeout(async () => {
                        for (const friendUid of uids) {
                            const sigRef = db.ref(`users/${friendUid}/partySignal`);
                            await sigRef.remove().catch(() => {});
                            await sigRef.set({ partyId, partySize }).catch(() => {});
                            sigRef.onDisconnect().remove();
                        }
                    }, 600);
                }
            };

            ws.onmessage = (event) => {
                let data;
                try { data = JSON.parse(event.data); } catch(e) { return; }
                handleServerMessage(data);
            };

            ws.onerror = () => {
                showToast('❌ Gagal connect ke server! Coba lagi.', 'error');
                cancelMatchmaking();
            };

            ws.onclose = () => {
                stopClientKeepAlive();
                stopAutoModeTimer();
                // Jika koneksi terputus saat sudah di dalam game, coba reconnect otomatis
                if (currentRoomId && myPlayerId) {
                    lsSet(LS.ROOM_ID, currentRoomId);
                    lsSet(LS.PLAYER_ID, myPlayerId);
                    lsSet(LS.GAME_ACTIVE, 'true');
                    addLog('🔄 Koneksi terputus, mencoba reconnect...');
                    reconnectAttempts = 0;
                    if (reconnectTimer) clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(() => reconnectToGame(currentRoomId, myPlayerId), 2000);
                }
            };
        }

        function cancelMatchmaking() {
            stopMatchmakingCountdown();
            hideMatchmakingFloatBar();

            // Jika sedang dalam party, beritahu semua anggota untuk batal cari lawan
            // HARUS dilakukan SEBELUM ws.close() agar LEAVE_QUEUE masih terkirim
            if ((_partyId || _partyFirebaseId) && currentUser) {
                const cancellerName = currentNickname || 'Pemain';
                // Gunakan _partyFirebaseId (ID roster Firebase asli, bukan sharedPartyId qp_xxx)
                const firebasePartyId = _partyFirebaseId || _partyId;
                // Beritahu anggota lain via Firebase agar mereka juga berhenti mencari
                db.ref(`partyRoster/${firebasePartyId}`).once('value').then(snap => {
                    if (!snap.exists()) return;
                    snap.forEach(child => {
                        const uid = child.key;
                        // Entry 'host' menyimpan UID host sebagai value-nya
                        const targetUid = uid === 'host' ? child.val() : uid;
                        if (!targetUid || targetUid === currentUser.uid) return;
                        db.ref(`users/${targetUid}/partyCancelSearch`).set({
                            cancelledBy: cancellerName,
                            ts: Date.now()
                        }).catch(() => {});
                        // PATCH C: Hapus partySignal lama agar tamu tidak salah masuk queue
                        // dengan partyId lama jika Firebase lambat mengirim sinyal sebelumnya
                        db.ref(`users/${targetUid}/partySignal`).remove().catch(() => {});
                    });
                }).catch(() => {});
            }

            // Hentikan antrian di server
            if (ws) {
                try { ws.send(JSON.stringify({ type: 'LEAVE_QUEUE' })); } catch(e) {}
                ws.onclose = null; ws.onerror = null;
                ws.close();
                ws = null;
            }

            soundEffects.bgMusic2.pause();
            soundEffects.bgMusic2.currentTime = 0;
            soundEffects.bgMusic.play().catch(() => {});

            // Jika sedang dalam party → kembalikan ke lobi party (party tidak dibubarkan)
            if ((_partyId || _partyFirebaseId || _isPartyGuest) && currentUser) {
                _partyQueueSize = null;
                // Matikan listener partyCancelSearch agar tidak re-trigger setelah cancel sendiri
                const _selfCsRef = db.ref(`users/${currentUser.uid}/partyCancelSearch`);
                _selfCsRef.off();
                _selfCsRef.remove().catch(() => {});
                // Kembalikan _partyId ke Firebase ID asli agar lobi party bisa berfungsi
                if (_partyFirebaseId) _partyId = _partyFirebaseId;
                _setPresenceStatus('inLobby');
                // FIX: Tamu punya state lengkap (_partyHostUid, _partyHostName, _isPartyGuest)
                // karena kita tidak reset saat masuk queue — render ulang lobi tamu dengan benar
                if (_isPartyGuest && _partyHostUid && _partyHostName) {
                    _showGuestPartyLobby(_partyHostUid, _partyHostName, _myPartySlot);
                } else {
                    document.getElementById('party-lobby-overlay').style.display = 'flex';
                }
                // PATCH A: Pasang ulang listener partySignal agar tamu bisa merespons
                // jika host menekan Mulai lagi
                if (_isPartyGuest && _partyFirebaseId) {
                    _startPartySignalListener(_partyFirebaseId);
                }
                return;
            }

            // Tidak ada party → kembali ke matchmaking-idle biasa
            _setPresenceStatus('online');
            _partyQueueSize = null;
            _partyFirebaseId = null;
            DOM.matchmakingScreen.classList.add('active');
            DOM.matchmakingScreen.querySelector('#matchmaking-idle').style.display = 'flex';
            DOM.matchmakingScreen.querySelector('#matchmaking-waiting').style.display = 'none';
            DOM.matchmakingScreen.querySelector('#match-starting').style.display = 'none';
            DOM.matchmakingScreen.style.justifyContent = 'flex-end';
        }

        function handleServerMessage(data) {
            switch (data.type) {
                case 'PARTY_SEARCH_CANCELLED': {
                    // Salah satu anggota party membatalkan dari sisi server (via LEAVE_QUEUE)
                    // Hentikan pencarian dan kembalikan ke lobi party
                    hideMatchmakingFloatBar();
                    stopMatchmakingCountdown();
                    if (ws) {
                        try { ws.send(JSON.stringify({ type: 'LEAVE_QUEUE' })); } catch(e) {}
                        ws.onclose = null; ws.onerror = null;
                        ws.close();
                        ws = null;
                    }
                    soundEffects.bgMusic2.pause();
                    soundEffects.bgMusic2.currentTime = 0;
                    soundEffects.bgMusic.play().catch(() => {});
                    _partyQueueSize = null;
                    // Kembalikan _partyId ke Firebase ID asli agar lobi berfungsi
                    if (_partyFirebaseId) _partyId = _partyFirebaseId;
                    _setPresenceStatus('inLobby');
                    // Jika tamu: render ulang tampilan lobi guest dengan data yang tersimpan
                    if (_isPartyGuest && _partyHostUid && _partyHostName) {
                        _showGuestPartyLobby(_partyHostUid, _partyHostName, _myPartySlot);
                    } else {
                        document.getElementById('party-lobby-overlay').style.display = 'flex';
                    }
                    const cancelName = data.cancelledByName || 'Salah satu pemain';
                    showToast(`ℹ️ ${cancelName} membatalkan pencarian lawan.`, 'info');
                    // PATCH A: Pasang ulang listener partySignal agar tamu bisa merespons
                    // jika host menekan Mulai lagi di siklus berikutnya
                    if (_isPartyGuest && _partyFirebaseId) {
                        _startPartySignalListener(_partyFirebaseId);
                    }
                    break;
                }

                case 'QUEUE_STATUS':
                    DOM.matchmakingScreen.querySelector('#queue-status').textContent = data.message;
                    break;

                case 'MATCH_STARTING':
                    stopMatchmakingCountdown();
                    DOM.matchmakingScreen.querySelector('#matchmaking-waiting').style.display = 'none';
                    DOM.matchmakingScreen.querySelector('#match-starting').style.display = 'block';
                    break;

                case 'PROVINCES_SELECTED': {
                    hideMatchmakingFloatBar();
                    closeAllScreens();
                    DOM.matchmakingScreen.classList.add('active');
                    // Sembunyikan idle (tombol RANKED dll) saat lawan ditemukan
                    DOM.matchmakingScreen.querySelector('#matchmaking-idle').style.display = 'none';
                    DOM.matchmakingScreen.querySelector('#matchmaking-waiting').style.display = 'none';
                    const provinces = data.provinces || [];
                    const mandatory = data.mandatory || 'Bangka Belitung';
                    const grid = document.getElementById('prov-grid');
                    if (grid) {
                        grid.innerHTML = '';
                        provinces.forEach(name => {
                            const chip = document.createElement('div');
                            chip.className = 'prov-chip' + (name === mandatory ? ' mandatory' : '');
                            const img = document.createElement('img');
                            img.src = av(`gambar/provinsi/${name}/peta (${name}).png`);
                            img.alt = name;
                            img.className = 'prov-chip-icon';
                            img.onerror = function() { this.style.display = 'none'; };
                            chip.appendChild(img);
                            chip.appendChild(document.createTextNode(name));
                            grid.appendChild(chip);
                        });
                    }
                    // Untuk custom room (pemain maupun penonton): tutup lobby dan tampilkan layar provinsi
                    if (_customRoomId || _customRoomRole) {
                        _resetCustomRoomOverlay();
                        document.getElementById('custom-room-overlay').style.display = 'none';
                        _stopCustomPresenceListener();
                        document.getElementById('custom-friend-picker').style.display = 'none';
                        DOM.matchmakingScreen.classList.add('active');
                        const _idle = DOM.matchmakingScreen.querySelector('#matchmaking-idle');
                        const _wait = DOM.matchmakingScreen.querySelector('#matchmaking-waiting');
                        const _start = document.getElementById('match-starting');
                        if (_idle) _idle.style.display = 'none';
                        if (_wait) _wait.style.display = 'none';
                        if (_start) _start.style.display = 'block';
                    }
                    // Hitung mundur — gunakan remainingMs jika tersedia (rejoin)
                    let secs = Math.ceil((data.remainingMs != null ? data.remainingMs : 6000) / 1000);
                    const numEl = document.getElementById('prov-countdown-num');
                    if (numEl) numEl.textContent = String(secs);
                    if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }
                    _cdInterval = setInterval(() => {
                        secs--;
                        if (numEl) numEl.textContent = String(Math.max(0, secs));
                        if (secs <= 0) { clearInterval(_cdInterval); _cdInterval = null; }
                    }, 1000);
                    break;
                }

                case 'ROOM_DISBANDED':
                    if (_customRoomId) {
                        // Beritahu server agar currentCustomRoomId di socket guest ikut di-clear
                        try { ws.send(JSON.stringify({ type: 'LEAVE_CUSTOM_ROOM', userUid: currentUser ? currentUser.uid : '' })); } catch(_) {}
                        _customRoomSlots.forEach(s => {
                            if (s?.pending && s.uid) db.ref(`users/${s.uid}/customRoomInvite`).remove().catch(() => {});
                        });
                        _customRoomId = null;
                        _customRoomRole = null;
                        _customRoomSlots = [];
                        _customPickerSlot = null;
                        _pendingCustomJoin = false;
                        _isCustomRoomCreator = false;
                        _resetCustomRoomOverlay();
                        document.getElementById('custom-room-overlay').style.display = 'none';
                        _stopCustomPresenceListener();
                        document.getElementById('custom-friend-picker').style.display = 'none';
                        _setPresenceStatus('online');
                        _startCustomRoomInviteListener();
                        showToast('⚠️ Host telah keluar. Custom room dibubarkan.', 'warning');
                    }
                    break;

                case 'KICKED_FROM_ROOM':
                    if (_customRoomId) {
                        // Beritahu server agar currentCustomRoomId di socket ini ikut di-clear
                        try { ws.send(JSON.stringify({ type: 'LEAVE_CUSTOM_ROOM', userUid: currentUser ? currentUser.uid : '' })); } catch(_) {}
                        _customRoomId = null;
                        _customRoomRole = null;
                        _customRoomSlots = [];
                        _customPickerSlot = null;
                        _pendingCustomJoin = false;
                        _isCustomRoomCreator = false;
                        _resetCustomRoomOverlay();
                        document.getElementById('custom-room-overlay').style.display = 'none';
                        _stopCustomPresenceListener();
                        document.getElementById('custom-friend-picker').style.display = 'none';
                        _setPresenceStatus('online');
                        _startCustomRoomInviteListener();
                        showToast('⚠️ Kamu dikeluarkan dari room oleh host.', 'warning');
                    }
                    break;

                case 'CUSTOM_ROOM_CREATED':
                    _customRoomId = data.roomId;
                    // Show lobby
                    document.getElementById('custom-room-overlay').style.display = 'flex';
                    _renderCustomRoomLobby();
                    break;

                case 'CUSTOM_ROOM_UPDATE':
                    if (data.roomId === _customRoomId) {
                        // Jika ini respons dari JOIN_CUSTOM_ROOM — buka lobby sekarang
                        if (_pendingCustomJoin) {
                            _pendingCustomJoin = false;
                            document.getElementById('custom-room-overlay').style.display = 'flex';
                        }
                        _handleCustomRoomUpdate(data);
                    }
                    break;

                case 'GAME_STARTED':
                    _setPresenceStatus('inGame');
                    // Handle custom room / spectator flags
                    _isCustomRoom = !!data.isCustomRoom;
                    _isSpectator  = !!data.isSpectator;

                    // Close custom room lobby & picker if open
                    _resetCustomRoomOverlay();
                    document.getElementById('custom-room-overlay').style.display = 'none';
                    _stopCustomPresenceListener();
                    document.getElementById('custom-friend-picker').style.display = 'none';
                    // Sembunyikan match-starting (provinces preview) jika ditampilkan dari custom room
                    const _msEl = document.getElementById('match-starting');
                    if (_msEl) _msEl.style.display = 'none';
                    _customRoomId     = null;
                    _customPickerSlot = null;
                    _pendingCustomJoin = false;

                    // Reset save flags agar tidak bocor dari game sebelumnya
                    pendingClientSaveRank = null;
                    hasGameOverSaved = false;
                    _endGameShown = false;
                    _rankSnapshot = null; // reset dulu
                    // Simpan snapshot rankData SEBELUM game — dipakai endGame() untuk tampilan rank change yang benar
                    // (skip for custom rooms — no rank changes)
                    if (currentUser && !_isCustomRoom) {
                        db.ref(`users/${currentUser.uid}/rankData`).get().then(snap => {
                            _rankSnapshot = snap.exists() ? snap.val() : { rankName: 'Bronze III', points: 0 };
                        }).catch(() => { _rankSnapshot = null; });
                    }
                    currentRoomId = data.roomId;
                    myPlayerId = data.playerId; // null for spectators

                    // Save session ke localStorage agar bisa rejoin setelah refresh/ganti device
                    if (!_isSpectator) {
                        lsSet(LS.ROOM_ID, data.roomId);
                        lsSet(LS.PLAYER_ID, data.playerId);
                        lsSet(LS.GAME_ACTIVE, 'true');
                        lsDel(LS.IS_SPECTATOR);
                    } else {
                        lsSet(LS.ROOM_ID, data.roomId);
                        lsSet(LS.IS_SPECTATOR, 'true');
                        lsSet(LS.GAME_ACTIVE, 'true');
                        lsDel(LS.PLAYER_ID);
                    }

                    setTimeout(() => {
                        DOM.matchmakingScreen.classList.remove('active');
                        document.getElementById('profile-badge').style.display = 'none';
                        DOM.gameContainer.classList.add('active');
                        // Show/hide spectator banner
                        const spBanner = document.getElementById('spectator-banner');
                        if (spBanner) spBanner.style.display = _isSpectator ? 'block' : 'none';
                        // Reset tombol menyerah agar tidak stuck disabled dari match sebelumnya
                        const btnSurrender = document.getElementById('btn-surrender');
                        if (btnSurrender) {
                            if (_isSpectator) {
                                btnSurrender.style.display = 'none';
                            } else {
                                btnSurrender.disabled = false;
                                btnSurrender.style.opacity = '1';
                                btnSurrender.style.display = 'inline-block';
                            }
                        }
                        // Reset inline styles yang di-set oleh spectator view agar tidak bocor ke sesi player berikutnya
                        if (!_isSpectator) {
                            const _btnDraw     = document.getElementById('btn-draw');
                            const _btnDrawInfo = document.getElementById('btn-draw-level-info');
                            const _pCardStat   = document.getElementById('player-cards')?.closest('.player-stat');
                            const _pPowerStat  = document.getElementById('player-power')?.closest('.player-stat');
                            if (_btnDraw)     _btnDraw.style.display     = '';
                            if (_btnDrawInfo) _btnDrawInfo.style.display = '';
                            if (_pCardStat)   _pCardStat.style.display   = '';
                            if (_pPowerStat)  _pPowerStat.style.display  = '';
                            // Bersihkan deck dari wrapper scaled-card sisa spectator view,
                            // agar updatePlayerUI tidak mencampur elemen lama (skala 65%) dengan kartu baru
                            const _deckDiv = document.getElementById('player-deck');
                            if (_deckDiv) _deckDiv.innerHTML = '';
                        }
                        updateGameUI(data.state);
                        startPingMeasurement();
                        addLog(_isSpectator ? '📺 Kamu menonton pertandingan ini.' : '🎮 Game dimulai! Selamat bermain!');
                        // Pastikan bgMusic2 jalan untuk semua pemain (host, guest, party, custom room)
                        try {
                            soundEffects.bgMusic.pause();
                            soundEffects.bgMusic2.play().catch(() => {
                                if (window._bgMusic2FirstClickHandler) {
                                    document.removeEventListener('click', window._bgMusic2FirstClickHandler);
                                }
                                window._bgMusic2FirstClickHandler = function() {
                                    soundEffects.bgMusic2.play().catch(() => {});
                                    document.removeEventListener('click', window._bgMusic2FirstClickHandler);
                                    window._bgMusic2FirstClickHandler = null;
                                };
                                document.addEventListener('click', window._bgMusic2FirstClickHandler);
                            });
                        } catch(e) {}
                    }, 500);
                    break;

                case 'SERVER_PONG': {
                    const rtt = Date.now() - data.ts;
                    if (ws && ws.readyState === 1 && currentRoomId) {
                        try { ws.send(JSON.stringify({ type: 'REPORT_PING', ping: rtt, roomId: currentRoomId })); } catch(e) {}
                    }
                    break;
                }

                case 'PING_DATA':
                    if (data.pings) updatePingPanel(data.pings);
                    break;

                case 'GAME_STATE_UPDATE':
                    updateGameUI(data.state);
                    // Catat rank segera saat kita menang (misal menyerah),
                    // agar pendingClientSaveRank sudah siap sebelum SAVE_STATS_CLIENT tiba.
                    // Skip for custom room / spectator — no stats saving
                    if (!_isCustomRoom && !_isSpectator && !hasGameOverSaved && !pendingClientSaveRank && myPlayerId && data.state && data.state.players) {
                        const _me = data.state.players.find(p => p.id === myPlayerId);
                        if (_me && _me.winner && _me.rank > 0 && !_me.isBot) {
                            pendingClientSaveRank = _me.rank;
                        }
                    }
                    break;

                case 'GAME_OVER':
                    if (data.players) endGame(data.players);
                    break;

                case 'STATS_SAVED':
                    // Server berhasil simpan ke Firebase — tandai agar goToHome tidak double-save
                    hasGameOverSaved = true;
                    pendingClientSaveRank = null;
                    // Re-fetch profil agar UI ter-update
                    setTimeout(() => {
                        if (currentUser) { loadProfileData(); loadProfileStats(); }
                        // history diupdate otomatis oleh real-time listener saat Firebase menerima data baru
                    }, 1000);
                    break;

                case 'SAVE_STATS_CLIENT': {
                    // Server gagal menyimpan — client menjadi fallback.
                    // Custom room & spectator tidak ada stats — abaikan
                    if (_isCustomRoom || _isSpectator) break;
                    // Prioritas: rank dari pesan server > pendingClientSaveRank > gameState
                    // (data.rank selalu ada karena server sekarang menyertakannya)
                    let _rankToSave = data.rank || pendingClientSaveRank;
                    if (!_rankToSave && gameState && myPlayerId && gameState.players) {
                        const _me2 = gameState.players.find(p => p.id === myPlayerId);
                        if (_me2 && _me2.winner && _me2.rank > 0 && !_me2.isBot) _rankToSave = _me2.rank;
                    }
                    if (_rankToSave) {
                        // Clear SEBELUM save agar jika server kirim SAVE_STATS_CLIENT 2x,
                        // save kedua tidak dipicu (mencegah double-count rank di Firebase)
                        pendingClientSaveRank = null;
                        saveMatchResult(_rankToSave);
                    }
                    // Re-fetch setelah client save selesai menulis ke Firebase
                    setTimeout(() => {
                        if (currentUser) { loadProfileData(); loadProfileStats(); }
                        // history diupdate otomatis oleh real-time listener
                    }, 2000);
                    break;
                }

                case 'LOG':
                    if (data.message) addLog(data.message);
                    break;

                case 'ERROR':
                    showToast('❌ ' + data.message, 'error');
                    // Reset tombol Mulai jika gagal memulai Custom Room
                    { const _btnS = document.getElementById('btn-custom-start');
                      if (_btnS && _btnS.textContent.includes('Memulai')) {
                          _btnS.textContent = '▶ Mulai';
                          _btnS.disabled = false;
                      } }
                    // Jika error terjadi saat mencoba join custom room, reset seluruh state
                    if (_pendingCustomJoin) {
                        _pendingCustomJoin = false;
                        _customRoomId = null;
                        _customRoomRole = null;
                        _customRoomSlots = [];
                        _customPickerSlot = null;
                        document.getElementById('custom-room-overlay').style.display = 'none';
                        _stopCustomPresenceListener();
                        document.getElementById('custom-friend-picker').style.display = 'none';
                    }
                    break;

                case 'PING':
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        try { ws.send(JSON.stringify({ type: 'PONG' })); } catch(e) {}
                    }
                    break;

                case 'PARTY_NOT_FOUND':
                    // Server tidak punya party queuing untuk tamu ini — kembali ke lobi.
                    // JANGAN tutup ws: koneksi masih valid, tidak perlu disconnect.
                    // (ws.close() di sini adalah penyebab log "Disconnected: re7 / Hidup Damai" 0ms)
                    hideMatchmakingFloatBar();
                    stopMatchmakingCountdown();
                    _partyQueueSize = null;
                    if (_partyFirebaseId) _partyId = _partyFirebaseId;
                    _setPresenceStatus('inLobby');
                    if (_isPartyGuest && _partyHostUid && _partyHostName) {
                        _showGuestPartyLobby(_partyHostUid, _partyHostName, _myPartySlot);
                    } else {
                        document.getElementById('party-lobby-overlay').style.display = 'flex';
                    }
                    if (_isPartyGuest && _partyFirebaseId) {
                        _startPartySignalListener(_partyFirebaseId);
                    }
                    break;

                // ── WebSocket Party (server-driven party queue) ─────────────
                case 'PARTY_QUEUING': {
                    // Server memerintahkan semua anggota party untuk segera masuk antrian
                    // Berlaku saat party lobby berbasis WebSocket digunakan (bukan Firebase)
                    // _partyFirebaseId sudah diset sebelumnya — jangan overwrite
                    _partyId = data.sharedPartyId;
                    _partyQueueSize = data.partySize || 2;
                    // Kirim JOIN_MATCHMAKING pada koneksi yang sudah ada
                    const pqName = currentNickname || lsGet(LS.NICKNAME) || 'Player';
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'JOIN_MATCHMAKING',
                            playerName: pqName,
                            userUid: currentUser ? currentUser.uid : '',
                            partyId: data.sharedPartyId,
                            partySize: data.partySize
                        }));
                    }
                    // Tampilkan floating bar (menunggu match sebagai tamu party)
                    showMatchmakingFloatBar();
                    DOM.matchmakingScreen.querySelector('#match-starting').style.display = 'none';
                    DOM.matchmakingScreen.querySelector('#queue-status').textContent = 'Party siap — menunggu lawan...';
                    break;
                }
            }
        }

        let _prevPhase = null;
        let _prevRound = null;
        let _prevHasPlayed = {};
        let _prevMustForcePick = {};
        let _prevMustDraw = {};
        let _prevHands = {};
        let _prevFreed = {};
        function updateGameUI(newState) {
            const prevPhase = _prevPhase;
            gameState = newState;
            _prevPhase = newState.phase;
            _prevRound = newState.round;

            if (newState.players) {
                // Deteksi pemain yang baru saja menjatuhkan kartu (hasPlayed baru jadi true)
                // Skip jika sebelumnya mustForcePick (berarti Mengambil kartu, bukan menjatuhkan)
                newState.players.forEach(p => {
                    if (p.hasPlayed && !_prevHasPlayed[p.id] && !_prevMustForcePick[p.id] && !_prevMustDraw[p.id]) {
                        const prevHand = _prevHands[p.id] || [];
                        const newHandIds = new Set((p.hand || []).map(c => c.id));
                        const played = prevHand.find(c => !newHandIds.has(c.id));
                        const cardName = played ? played.name : '';
                        showNotification(`🎴 ${_shortName(p.name)} menjatuhkan kartu${cardName ? ' ' + cardName : ''}`);
                    }
                });
                // Simpan state sekarang
                // Deteksi pemain yang baru dibebaskan dari force card
                const freedPlayers = newState.players.filter(p => p.freed && !_prevFreed[p.id] && !p.winner).map(p => _shortName(p.name));
                if (freedPlayers.length > 0) {
                    showNotification(`✅ ${freedPlayers.join(' dan ')} dibebaskan dari force card`);
                }

                _prevHasPlayed = {};
                _prevMustForcePick = {};
                _prevMustDraw = {};
                _prevHands = {};
                _prevFreed = {};
                newState.players.forEach(p => {
                    _prevHasPlayed[p.id] = p.hasPlayed;
                    _prevMustForcePick[p.id] = p.mustForcePick;
                    _prevMustDraw[p.id] = p.mustDraw;
                    _prevHands[p.id] = p.hand ? [...p.hand] : [];
                    _prevFreed[p.id] = p.freed;
                });

                // Saat baru masuk phase 2, tampilkan siapa yang terkena draw card
                if (prevPhase === 1 && newState.phase === 2) {
                    const drawPlayers = newState.players.filter(p => p.mustDraw && !p.winner).map(p => _shortName(p.name));
                    if (drawPlayers.length > 0) {
                        showNotification(`🎴 ${drawPlayers.join(' dan ')} terkena draw card`);
                    }
                }

                // Reset saat ronde baru
                if (_prevRound !== newState.round) {
                    _prevHasPlayed = {};
                    _prevMustForcePick = {};
                    _prevMustDraw = {};
                    _prevHands = {};
                    _prevFreed = {};
                }
            }

            playCardInProgress = false;
            updateUI();
        }

        function _renderSpectatorView() {
            if (!gameState) return;
            const gs = gameState;

            // Round, phase, province
            const rn = document.getElementById('round-number');
            const ph = document.getElementById('phase-name');
            const pl = document.getElementById('province-label');
            if (rn) rn.textContent = gs.round || 1;
            if (ph) ph.textContent = gs.phase || 1;
            if (pl) pl.innerHTML = gs.currentProvince ? `<img src="${av(`gambar/provinsi/${gs.currentProvince}/peta (${gs.currentProvince}).png`)}" alt="Peta" class="province-label-map" onerror="this.style.display='none'"> ${gs.currentProvince}` : 'Menunggu kartu...';

            // Draw/discard pile counts
            const dp2 = document.getElementById('draw-pile-count-2');
            const dc2 = document.getElementById('discard-pile-count-2');
            if (dp2) dp2.textContent = gs.drawPile ? gs.drawPile.length : 0;
            if (dc2) dc2.textContent = gs.discardPile ? gs.discardPile.length : 0;

            // Province info button
            const infoBtn = document.getElementById('province-info-btn');
            if (infoBtn) {
                infoBtn.style.display = gs.currentProvince ? 'flex' : 'none';
                if (!infoBtn._listenerAdded) { infoBtn.addEventListener('click', () => { playSound('button'); showProvinceInfo(); }); infoBtn._listenerAdded = true; }
            }

            // Close province info modal (spectator path)
            const closeBtn = document.getElementById('province-info-close');
            if (closeBtn && !closeBtn._listenerAdded) {
                closeBtn.addEventListener('click', () => { playSound('button'); closeProvinceInfo(); });
                closeBtn._listenerAdded = true;
            }

            // Top cards (safe to call with null myPlayerId)
            updateTopCardsUI();

            // All players in opponents panel (myPlayerId=null → all players shown, no self filter)
            updateBotsUI();

            // Change "ANDA" header to "Penonton"
            const hdr = document.getElementById('player-header-name');
            if (hdr) hdr.textContent = '📺 Penonton';

            // Hide Draw Card button and draw level info
            const btnDraw = document.getElementById('btn-draw');
            const btnDrawInfo = document.getElementById('btn-draw-level-info');
            if (btnDraw) btnDraw.style.display = 'none';
            if (btnDrawInfo) btnDrawInfo.style.display = 'none';

            // Hide Kartu & Power stat rows (spectator has none)
            const pCardStat = document.getElementById('player-cards')?.closest('.player-stat');
            const pPowerStat = document.getElementById('player-power')?.closest('.player-stat');
            if (pCardStat) pCardStat.style.display = 'none';
            if (pPowerStat) pPowerStat.style.display = 'none';

            // Show all players' hands as mini (65%) scaled cards in player-deck area
            const deckDiv = document.getElementById('player-deck');
            if (deckDiv && gs.players) {
                deckDiv.innerHTML = '';
                gs.players.forEach(p => {
                    const section = document.createElement('div');
                    section.style.cssText = 'margin-bottom:16px; width:100%; box-sizing:border-box;';
                    const medals = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '💀' };
                    const statusLabel = p.winner
                        ? `${medals[p.rank] || '🏅'} Peringkat ${p.rank}`
                        : `${p.hand?.length ?? 0} kartu | ⚡${p.totalPower ?? 0}`;
                    const indicators = [];
                    if (p.mustDraw) indicators.push('⚠️ Draw');
                    if (p.mustForcePick) indicators.push('⚡ ForcePick');
                    if (p.freed) indicators.push('✅ Bebas');
                    if (p.autoMode) indicators.push('🔄 AFK');
                    const nameDiv = document.createElement('div');
                    nameDiv.style.cssText = `font-weight:bold; margin-bottom:7px; color:${p.winner ? '#aaa' : '#fff'}; display:flex; align-items:center; gap:6px; flex-wrap:wrap;`;
                    const nameSpan = document.createElement('span');
                    nameSpan.innerHTML = `${p.isBot ? '🤖' : '👤'} ${escHtml(getBotDisplayName(p))} — ${statusLabel}`
                        + (indicators.length ? ` <span style="font-size:0.78em;opacity:0.7">[${indicators.join(' ')}]</span>` : '');
                    nameDiv.appendChild(nameSpan);
                    if (!p.winner) {
                        const dlBtn = document.createElement('button');
                        dlBtn.className = 'btn-dl-info';
                        dlBtn.title = `Info Draw Level ${getBotDisplayName(p)}`;
                        dlBtn.textContent = 'ℹ️';
                        dlBtn.addEventListener('click', () => { playSound('button'); showDrawLevelInfo(p.id); });
                        nameDiv.appendChild(dlBtn);
                    }
                    section.appendChild(nameDiv);
                    if (!p.winner && p.hand?.length > 0) {
                        const cardsRow = document.createElement('div');
                        cardsRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; align-items:flex-start;';
                        p.hand.forEach(card => {
                            // Wrapper sized to the scaled card (108*0.65≈70px, 152*0.65≈99px)
                            const wrapper = document.createElement('div');
                            wrapper.style.cssText = 'display:inline-block; width:70px; height:99px; flex-shrink:0; overflow:hidden;';
                            const cardEl = createCardElement(card);
                            cardEl.style.cssText = 'transform:scale(0.65); transform-origin:top left; cursor:default; pointer-events:none;';
                            wrapper.appendChild(cardEl);
                            cardsRow.appendChild(wrapper);
                        });
                        section.appendChild(cardsRow);
                    } else if (p.winner) {
                        const noCard = document.createElement('div');
                        noCard.style.cssText = 'opacity:0.4; font-style:italic; font-size:0.82em;';
                        noCard.textContent = 'Tidak ada kartu di tangan';
                        section.appendChild(noCard);
                    }
                    deckDiv.appendChild(section);
                });
            }
        }

        // =============================================
        // PLAYER ACTIONS (Send to Server)
        // =============================================
        // Debounce flag: cegah double-send PLAY_CARD akibat double-click atau lag
        let playCardInProgress = false;

        function _disableAllHandCards() {
            document.querySelectorAll('#player-deck .card').forEach(el => {
                el.classList.remove('selectable');
                el.classList.add('disabled');
                el.onclick = null;
                el.style.cursor = 'default';
            });
        }

        function playerPlayPhase1(card) {
            if (!ws || !currentRoomId || playCardInProgress) return;
            playCardInProgress = true;
            _disableAllHandCards(); // langsung disable sebelum server balas
            ensureBgMusic2();
            ws.send(JSON.stringify({
                type: 'PLAY_CARD',
                roomId: currentRoomId,
                cardId: card.id
            }));
            // Reset setelah 3 detik jika server tidak kunjung reply (fallback)
            setTimeout(() => { playCardInProgress = false; }, 3000);
        }

        function playerPlayCard(card) {
            if (!ws || !currentRoomId || playCardInProgress) return;
            playCardInProgress = true;
            _disableAllHandCards(); // langsung disable sebelum server balas
            ensureBgMusic2();
            ws.send(JSON.stringify({
                type: 'PLAY_CARD',
                roomId: currentRoomId,
                cardId: card.id
            }));
            setTimeout(() => { playCardInProgress = false; }, 3000);
        }

        function playerDrawCard() {
            const player = gameState && gameState.players.find(p => p.id === myPlayerId);
            if (!player || !player.mustDraw || !ws || !currentRoomId) return;
            ensureBgMusic2();
            playSound('drawCard');
            ws.send(JSON.stringify({
                type: 'DRAW_CARD',
                roomId: currentRoomId
            }));
        }

        function playerSelectForcePickCard(card) {
            const player = gameState && gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;

            if (forcePickClickDebounce || player.isProcessingAction) return;
            ensureBgMusic2();

            if (autoForcePickTimer) { clearTimeout(autoForcePickTimer); autoForcePickTimer = null; }
            if (player.emergencyTimeoutId) { clearTimeout(player.emergencyTimeoutId); player.emergencyTimeoutId = null; }

            forcePickClickDebounce = true;
            player.isProcessingAction = true;

            const cardIndex = gameState.topCard.findIndex(c => c.id === card.id);
            if (cardIndex === -1) {
                forcePickClickDebounce = false;
                player.isProcessingAction = false;
                return;
            }

            playSound('forcePick');

            // Disable all selectable cards in UI immediately for feedback
            const topCardsDiv = document.getElementById('top-cards');
            topCardsDiv.querySelectorAll('.card.selectable').forEach(cardEl => {
                cardEl.classList.remove('selectable');
                cardEl.classList.add('disabled');
                cardEl.style.pointerEvents = 'none';
                cardEl.onclick = null;
                if (cardEl._forcePickHandler) {
                    cardEl.removeEventListener('click', cardEl._forcePickHandler);
                }
            });

            // Send to server
            ws.send(JSON.stringify({
                type: 'FORCE_PICK_CARD',
                roomId: currentRoomId,
                cardId: card.id
            }));

            // Reset debounce after short delay (server will update state)
            setTimeout(() => {
                forcePickClickDebounce = false;
                player.isProcessingAction = false;
            }, 1000);
        }

        // =============================================
        // UTILITY
        // =============================================
        function addLog(message) {
            const logContainer = document.getElementById('game-log');
            if (!logContainer) return;
            const logEntry = document.createElement('div');
            logEntry.classList.add('log-entry');
            logEntry.textContent = message;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;


            const isImportant = message.includes('MENANG') ||
                message.includes('mendapat giliran Tahap 1') ||
                (message.includes('Mengambil kartu') && !message.includes('AUTO'));
            if (isImportant) showNotification(message);
        }

        // Toast notification — gantikan alert() di seluruh app
        function showToast(message, type = 'info', duration = 3500) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const t = document.createElement('div');
            t.className = `toast toast-${type}`;
            t.textContent = message;
            container.appendChild(t);
            setTimeout(() => {
                t.style.animation = 'toastOut .25s ease forwards';
                setTimeout(() => t.remove(), 250);
            }, duration);
        }

        // Matchmaking countdown — hitung mundur 30 detik sebelum bot masuk
        let _matchmakingCountdownInterval = null;
        function startMatchmakingCountdown() {
            stopMatchmakingCountdown();
            const el = document.getElementById('matchmaking-bot-countdown');
            if (!el) return;
            let secs = 30;
            const update = () => {
                el.textContent = secs > 0
                    ? `⏳ Bot bergabung dalam ${secs} detik jika tidak ada pemain...`
                    : '🤖 Menambahkan bot ke pertandingan...';
            };
            // el.style.display = 'block'; // Disembunyikan — bot disamarkan sebagai pemain
            _matchmakingCountdownInterval = setInterval(() => {
                secs--;
                update();
                if (secs <= 0) stopMatchmakingCountdown(false); // berhenti tapi tetap tampil pesan terakhir
            }, 1000);
        }
        function stopMatchmakingCountdown(hide = true) {
            if (_matchmakingCountdownInterval) {
                clearInterval(_matchmakingCountdownInterval);
                _matchmakingCountdownInterval = null;
            }
            if (hide) {
                const el = document.getElementById('matchmaking-bot-countdown');
                if (el) el.style.display = 'none';
            }
        }

        const _notifQueue = [];
        let _notifBusy = false;
        let _notifCurrent = null;
        let _notifDismissTimer = null;
        function _dismissCurrent(then) {
            if (!_notifCurrent) { then && then(); return; }
            clearTimeout(_notifDismissTimer);
            _notifCurrent.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (_notifCurrent) { _notifCurrent.remove(); _notifCurrent = null; }
                _notifBusy = false;
                then && then();
            }, 300);
        }
        function _processNotifQueue() {
            if (_notifBusy || _notifQueue.length === 0) return;
            _notifBusy = true;
            const message = _notifQueue.shift();
            const n = document.createElement('div');
            n.className = 'game-notification';
            n.textContent = message;
            const bg = message.includes('DIBEBASKAN') || message.includes('MENANG') || message.includes('Tahap 1')
                ? 'linear-gradient(135deg,#4caf50 0%,#2e7d32 100%)'
                : message.includes('Mengambil')
                ? 'linear-gradient(135deg,#f57c00 0%,#e65100 100%)'
                : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)';
            n.style.cssText = `
                position:fixed; right:20px; top:20px;
                background:${bg};
                color:white; padding:12px 20px; border-radius:10px;
                box-shadow:0 4px 15px rgba(0,0,0,0.3); z-index:10000;
                font-weight:bold; animation:slideInRight 0.3s ease-out;
                max-width:300px; font-size:0.9em;
            `;
            document.body.appendChild(n);
            _notifCurrent = n;

            // Setelah 1 detik: jika ada antrian, langsung ganti; jika tidak, tunggu hingga 2 detik
            _notifDismissTimer = setTimeout(() => {
                if (_notifQueue.length > 0) {
                    _dismissCurrent(_processNotifQueue);
                } else {
                    // Tidak ada antrian — tunggu maksimal 1 detik lagi (total 2 detik)
                    _notifDismissTimer = setTimeout(() => {
                        _dismissCurrent(_processNotifQueue);
                    }, 1000);
                }
            }, 1000);
        }
        function _shortName(name) {
            return name.length > 12 ? name.slice(0, 12) + '...' : name;
        }
        function showNotification(message) {
            _notifQueue.push(message);
            if (_notifBusy && _notifCurrent) {
                // Ada notifikasi yang sedang "menunggu" — langsung ganti
                _dismissCurrent(_processNotifQueue);
            } else {
                _processNotifQueue();
            }
        }

        // =============================================
        // CARD ELEMENT CREATION
        // =============================================
        function createCardElement(card) {
            const div = document.createElement('div');
            div.className = `card ${card.rarity}`;
            div.dataset.cardId = card.id;
            if (card.province) div.dataset.province = card.province;

            const rarityEmojis = { mythic:'👑', legendary:'🔥', epic:'👾', rareplus:'💎', rarestar:'💙', rare:'💠', uncommon:'💚', uncommonplus:'🍀', commonplus:'🟢', common:'⚪' };
            const emojiMap = { 'SDA Unggulan':'⛰️', 'Bangunan Bersejarah':'🏛️', 'Sektor Ekonomi':'💰', 'Rumah Adat':'🏠', 'Senjata Tradisional':'🗡️', 'Pakaian Adat':'👘', 'Alat Musik':'🎵', 'Tarian':'💃', 'Adat Istiadat':'🏮', 'Makanan Khas':'🍜' };

            const fallbackEmoji = emojiMap[card.type] || '🎴';
            let imageContent = '';
            if (card.province) {
                const imgSrc = av(`gambar/provinsi/${card.province}/${card.name}.png`);
                imageContent = `<img src="${imgSrc}" alt="${card.name}" onerror="this.parentElement.innerHTML='${fallbackEmoji}';">`;
            } else {
                imageContent = fallbackEmoji;
            }

            div.innerHTML = `
                <div class="card-rarity">${rarityEmojis[card.rarity] || ''}</div>
                <div class="card-image">${imageContent}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type}</div>
            `;
            return div;
        }

        // =============================================
        // PROVINCE INFO MODAL
        // =============================================
        function showProvinceInfo() {
            if (!gameState || !gameState.currentProvince) return;
            const provinceData = provinces.find(p => p.name === gameState.currentProvince);
            if (!provinceData) return;

            document.getElementById('province-info-title').textContent = `📍 ${gameState.currentProvince}`;

            const gridDiv = document.getElementById('province-cards-grid');
            gridDiv.innerHTML = '';

            const player = gameState.players.find(p => p.id === myPlayerId);
            const playerCardIds = player ? player.hand.map(c => c.id) : [];

            const rarityEmojis = { mythic:'👑', legendary:'🔥', epic:'👾', rareplus:'💎', rarestar:'💙', rare:'💠', uncommon:'💚', uncommonplus:'🍀', commonplus:'🟢', common:'⚪' };
            const emojiMap = { 'SDA Unggulan':'⛰️', 'Bangunan Bersejarah':'🏛️', 'Sektor Ekonomi':'💰', 'Rumah Adat':'🏠', 'Senjata Tradisional':'🗡️', 'Pakaian Adat':'👘', 'Alat Musik':'🎵', 'Tarian':'💃', 'Adat Istiadat':'🏮', 'Makanan Khas':'🍜' };

            provinceData.cards.forEach(card => {
                const cardDiv = document.createElement('div');
                const isOwned = playerCardIds.includes(`${gameState.currentProvince}-${card.name}`);
                cardDiv.className = `province-info-card ${card.rarity}`;

                const fallbackEmoji = emojiMap[card.type] || '🎴';
                let imageContent = '';
                const imgSrc = av(`gambar/provinsi/${gameState.currentProvince}/${card.name}.png`);
                imageContent = `<img src="${imgSrc}" alt="${card.name}" onerror="this.parentElement.innerHTML='${fallbackEmoji}';">`;

                cardDiv.innerHTML = `
                    <div class="province-info-card-rarity">${rarityEmojis[card.rarity] || ''}</div>
                    ${isOwned ? '<div class="province-info-card-owned">✅ Dimiliki</div>' : ''}
                    <div class="province-info-card-image">${imageContent}</div>
                    <div class="province-info-card-name">${card.name}</div>
                    <div class="province-info-card-type">${card.type}</div>
                `;
                gridDiv.appendChild(cardDiv);
            });

            document.getElementById('province-info-modal').classList.add('active');
        }

        function closeProvinceInfo() {
            playSound('x');
            document.getElementById('province-info-modal').classList.remove('active');
        }

        // =============================================
        // FORCE PICK INTERACTION
        // =============================================
        function enableForcePickInteraction() {
            if (!gameState || !myPlayerId) return;
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;

            if (!gameState.forcePickMode || player.hasPlayed) return;
            if (!gameState.forcePickPlayers.some(p => p.id === player.id)) return;

            const topCardsDiv = document.getElementById('top-cards');

            gameState.topCard.forEach(card => {
                const cardEl = topCardsDiv.querySelector(`[data-card-id="${card.id}"]`);
                if (!cardEl) return;

                if (cardEl._forcePickHandler) {
                    cardEl.removeEventListener('click', cardEl._forcePickHandler);
                }

                cardEl.classList.remove('zoom-in', 'zoom-out', 'fly-to-top', 'locked', 'disabled');
                cardEl.classList.add('selectable');
                cardEl.style.pointerEvents = 'auto';
                cardEl.style.cursor = 'pointer';
                cardEl.style.zIndex = '10';

                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    playerSelectForcePickCard(card);
                };
                cardEl._forcePickHandler = handler;
                cardEl.addEventListener('click', handler);
            });

            const penalty = document.getElementById('player-penalty');
            const penaltyText = document.getElementById('penalty-text');
            penalty.style.display = 'block';
            penaltyText.textContent = '⚠️ Ambil Kartu Di Atas';

            startForcePickHeartbeat();
            checkAndShowRefreshButton();
        }

        function startForcePickHeartbeat() {
            if (forcePickHeartbeat) { clearInterval(forcePickHeartbeat); forcePickHeartbeat = null; }

            forcePickHeartbeat = setInterval(() => {
                if (!gameState || !myPlayerId) return;
                const player = gameState.players.find(p => p.id === myPlayerId);
                if (!player) return;

                if (gameState.forcePickMode && gameState.forcePickPlayers.some(p => p.id === player.id) && !player.hasPlayed) {
                    const topCardsDiv = document.getElementById('top-cards');
                    if (!topCardsDiv) return;
                    const selectableCards = topCardsDiv.querySelectorAll('.card.selectable');
                    if (selectableCards.length === 0 && gameState.topCard.length > 0) {
                        player.isProcessingAction = false;
                        forcePickClickDebounce = false;
                        enableForcePickInteraction();
                    }
                } else {
                    clearInterval(forcePickHeartbeat);
                    forcePickHeartbeat = null;
                }
            }, 3000);
        }

        function stopForcePickHeartbeat() {
            if (forcePickHeartbeat) { clearInterval(forcePickHeartbeat); forcePickHeartbeat = null; }
        }

        function checkAndShowRefreshButton() {
            if (!gameState || !myPlayerId) return;
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;
            const btn = document.getElementById('sync-refresh-btn');
            if (!btn) return;

            if (gameState.forcePickMode && gameState.forcePickPlayers.some(p => p.id === player.id) && !player.hasPlayed && gameState.topCard.length > 0) {
                if (refreshButtonTimer) clearTimeout(refreshButtonTimer);
                refreshButtonTimer = setTimeout(() => {
                    btn.style.display = 'flex';
                    setTimeout(() => { if (btn.style.display === 'flex') btn.classList.add('urgent'); }, 7000);
                }, 15000);
            } else {
                btn.style.display = 'none';
                btn.classList.remove('urgent');
                if (refreshButtonTimer) { clearTimeout(refreshButtonTimer); refreshButtonTimer = null; }
            }
        }

        function hideRefreshButton() {
            const btn = document.getElementById('sync-refresh-btn');
            btn.style.display = 'none';
            btn.classList.remove('urgent', 'success');
            btn.textContent = '🔄';
            if (refreshButtonTimer) { clearTimeout(refreshButtonTimer); refreshButtonTimer = null; }
            if (autoForcePickTimer) { clearTimeout(autoForcePickTimer); autoForcePickTimer = null; }
        }

        function syncRefresh() {
            if (!gameState || !myPlayerId) return;
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;
            const btn = document.getElementById('sync-refresh-btn');

            btn.style.transform = 'rotate(360deg)';
            btn.style.transition = 'transform 0.5s ease-in-out';

            player.isProcessingAction = false;
            forcePickClickDebounce = false;

            stopForcePickHeartbeat();

            document.querySelectorAll('.card').forEach(cardEl => {
                cardEl.classList.remove('zoom-in', 'zoom-out', 'fly-to-top', 'shake', 'wrong-card');
            });

            if (gameState.forcePickMode && gameState.forcePickPlayers.some(p => p.id === player.id) && !player.hasPlayed) {
                setTimeout(() => enableForcePickInteraction(), 300);
            }

            updateUI();
            addLog('✅ Sinkronisasi selesai!');

            setTimeout(() => {
                btn.style.transform = 'rotate(0deg)';
                btn.classList.remove('urgent');
                btn.classList.add('success');
                btn.textContent = '✅';
                setTimeout(() => { btn.classList.remove('success'); btn.textContent = '🔄'; }, 2000);
            }, 500);
        }

        // =============================================
        // GAME OVER
        // =============================================
        // Rank posisi (1-4) yang menunggu disimpan sebagai fallback jika server gagal
        let pendingClientSaveRank = null;
        // Flag untuk kasus surrender → goToHome sebelum GAME_OVER diterima
        let hasGameOverSaved = false;
        // Guard agar endGame() hanya berjalan sekali per pertandingan
        let _endGameShown = false;
        // Snapshot rankData sebelum game dimulai — dipakai endGame() agar tidak baca nilai yang sudah di-update server
        let _rankSnapshot = null;
        // Interval countdown provinsi — disimpan agar bisa di-clear jika PROVINCES_SELECTED diterima ulang
        let _cdInterval = null;

        function endGame(finalRankings) {
            if (_endGameShown) return; // cegah pemanggilan ganda (misal dari WS stale)
            _endGameShown = true;
            stopPingMeasurement();
            lsClear();
            currentRoomId = null; // Cegah beforeunload menyimpan ulang room yang sudah selesai

            // Tutup surrender-choice & match-result modal jika masih terbuka
            document.getElementById('surrender-choice-modal').classList.remove('active');
            document.getElementById('match-result-modal').classList.remove('active');

            // Identifikasi pemain lokal:
            // - Coba dari gameState + myPlayerId (kondisi normal)
            // - Fallback ke currentNickname / localStorage (kondisi reconnect ke room finished)
            const myPlayer = gameState && myPlayerId && gameState.players.find(p => p.id === myPlayerId);
            const myName = myPlayer
                ? myPlayer.name
                : (currentNickname || lsGet(LS.NICKNAME) || null);

            const modal = DOM.gameOverModal;
            const rankings = DOM.rankings;
            rankings.innerHTML = '';
            const medals = ['🥇 Juara 1', '🥈 Juara 2', '🥉 Juara 3', '💀 Kalah'];
            [...finalRankings].sort((a, b) => a.rank - b.rank).forEach(p => {
                const div = document.createElement('div');
                const isMe = myPlayerId ? p.id === myPlayerId : (myName && p.name === myName);
                div.className = p.rank <= 3 ? 'ranking-item winner' : 'ranking-item loser';
                if (isMe) div.style.cssText = 'outline: 2px solid #ffd700; outline-offset: 2px;';
                div.textContent = `${medals[p.rank - 1] || '🎖️'} - ${getBotDisplayName(p)} (${p.hand ? p.hand.length : p.cardsLeft || 0} kartu tersisa)${isMe ? '  ← Kamu' : ''}`;
                rankings.appendChild(div);
            });
            modal.classList.add('active');

            // Hide spectator banner when game ends
            const spBanner = document.getElementById('spectator-banner');
            if (spBanner) spBanner.style.display = 'none';

            // Simpan rank sementara — server yang menyimpan ke Firebase secara utama.
            // Jika server gagal, server akan kirim SAVE_STATS_CLIENT dan client menjadi fallback.
            // Skip for custom rooms and spectators — no rank/stats impact.
            const myResult = (!_isCustomRoom && !_isSpectator && (myPlayerId || myName))
                ? [...finalRankings].find(p => (myPlayerId ? p.id === myPlayerId : p.name === myName) && !p.isBot)
                : null;
            if (myResult) {
                pendingClientSaveRank = myResult.rank;
                hasGameOverSaved = true;

                // Tampilkan rank change card — gunakan _rankSnapshot (diambil saat GAME_STARTED)
                // agar tidak terkena race condition dengan update Firebase dari server
                if (currentUser) {
                    const _showRankCard = (r) => {
                        const oldName = r.rankName || 'Bronze III';
                        const oldPts  = r.points   || 0;
                        const result  = calculateNewRank(oldName, oldPts, myResult.rank);
                        const tier    = getRankTier(oldName);
                        const delta   = RANK_CHANGES[tier][myResult.rank - 1];

                        const promoted = RANKS.indexOf(result.rankName) > RANKS.indexOf(oldName);
                        const demoted  = RANKS.indexOf(result.rankName) < RANKS.indexOf(oldName);
                        const title    = promoted ? '⬆️ NAIK RANK!' : demoted ? '⬇️ TURUN RANK!' : '📊 Perubahan Rank';
                        const deltaHtml = delta >= 0
                            ? `<span class="rank-change-delta-pos">+${delta} poin</span>`
                            : `<span class="rank-change-delta-neg">${delta} poin</span>`;
                        const newPtsLabel = `${result.points} poin`;

                        const card = document.createElement('div');
                        card.className = 'rank-change-card';
                        card.innerHTML = `
                            <div class="rank-change-title">${title}</div>
                            <div class="rank-change-body">
                                <div class="rank-change-item">
                                    <img src="${rankImgSrc(oldName)}" class="rank-change-img" alt="${oldName}">
                                    <div>${oldName}</div>
                                    <div class="rank-pts-old">${oldPts} poin</div>
                                </div>
                                <div class="rank-change-arrow">${deltaHtml}<br>→</div>
                                <div class="rank-change-item">
                                    <img src="${rankImgSrc(result.rankName)}" class="rank-change-img" alt="${result.rankName}">
                                    <div>${result.rankName}</div>
                                    <div class="rank-pts-new">${newPtsLabel}</div>
                                </div>
                            </div>`;
                        // Hapus kartu lama jika ada (safety net)
                        DOM.rankings.parentElement.querySelectorAll('.rank-change-card').forEach(el => el.remove());
                        DOM.rankings.after(card);
                    };
                    if (_rankSnapshot) {
                        _showRankCard(_rankSnapshot);
                    } else {
                        // Fallback: baca dari Firebase jika snapshot tidak tersedia
                        db.ref(`users/${currentUser.uid}/rankData`).get().then(snap => {
                            _showRankCard(snap.exists() ? snap.val() : { rankName: 'Bronze III', points: 0 });
                        }).catch(() => {});
                    }
                }
            }
        }

        // =============================================
        // SURRENDER CHOICE ACTIONS
        // =============================================

        /** Tutup popup pilihan → pemain lanjut menonton tanpa interaksi */
        function continueWatching() {
            document.getElementById('surrender-choice-modal').classList.remove('active');
        }

        /** Tutup popup pilihan → tampilkan popup hasil pertandingan saat ini */
        function showMatchResult() {
            document.getElementById('surrender-choice-modal').classList.remove('active');
            if (!gameState) return;

            const resultRankDiv = document.getElementById('match-result-rankings');
            const resultStatsDiv = document.getElementById('match-result-stats');
            const roundEl = document.getElementById('match-result-round');

            resultRankDiv.innerHTML = '';
            const statusLabel = gameState.gameOver ? '✅ Pertandingan Selesai' : '⚔️ Masih Berlangsung';
            roundEl.textContent = `Ronde ${gameState.round}  |  Fase ${gameState.phase}  |  ${statusLabel}`;

            const medals = ['🥇 Juara 1', '🥈 Juara 2', '🥉 Juara 3', '🎖️ Peringkat 4'];

            // Urutkan: yang sudah menang (berdasar rank), lalu yang masih main (kartu sedikit duluan)
            const sorted = [...gameState.players].sort((a, b) => {
                if (a.winner && b.winner) return a.rank - b.rank;
                if (a.winner) return -1;
                if (b.winner) return 1;
                return a.hand.length - b.hand.length;
            });

            sorted.forEach(p => {
                const div = document.createElement('div');
                const isMe = p.id === myPlayerId;
                const rankLabel = p.winner
                    ? (medals[p.rank - 1] || `🎖️ Peringkat ${p.rank}`)
                    : '⚔️ Masih bermain';
                div.className = `ranking-item ${p.winner && p.rank <= 3 ? 'winner' : p.winner ? 'loser' : ''}`;
                if (isMe) {
                    div.style.cssText = 'outline: 2px solid #ffd700; outline-offset:2px; background: linear-gradient(135deg,#fff9e6,#ffe082);';
                }
                div.innerHTML = `${rankLabel} &mdash; <strong>${escHtml(getBotDisplayName(p))}</strong> `
                    + `👤 `
                    + `<span style="font-weight:normal;color:#666">(${p.hand.length} kartu | ⚡${p.totalPower})</span>`
                    + (isMe ? ' <span style="color:#e65100;font-weight:bold">← Kamu</span>' : '');
                resultRankDiv.appendChild(div);
            });

            resultStatsDiv.innerHTML = `
                <span>📋 Ronde ke-${gameState.round}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                <span>🔶 Kartu Tersisa: ${gameState.drawPile ? gameState.drawPile.length : 0} kartu</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                <span>🗑️ Kartu Terpakai: ${gameState.discardPile ? gameState.discardPile.length : 0} kartu</span>
            `;

            document.getElementById('match-result-modal').classList.add('active');

            // Tampilkan rank change jika rank pemain sudah ditentukan (skip untuk Custom Room)
            const rcContainer = document.getElementById('match-result-rank-change');
            rcContainer.innerHTML = '';
            if (currentUser && myPlayerId && !_isCustomRoom) {
                const me = gameState.players.find(p => p.id === myPlayerId);
                if (me && me.winner && me.rank > 0) {
                    const _showRankCard2 = (r) => {
                        const oldName = r.rankName || 'Bronze III';
                        const oldPts  = r.points   || 0;
                        const result  = calculateNewRank(oldName, oldPts, me.rank);
                        const tier    = getRankTier(oldName);
                        const delta   = RANK_CHANGES[tier][me.rank - 1];

                        const promoted = RANKS.indexOf(result.rankName) > RANKS.indexOf(oldName);
                        const demoted  = RANKS.indexOf(result.rankName) < RANKS.indexOf(oldName);
                        const title    = promoted ? '⬆️ NAIK RANK!' : demoted ? '⬇️ TURUN RANK!' : '📊 Perubahan Rank';
                        const deltaHtml = delta >= 0
                            ? `<span class="rank-change-delta-pos">+${delta} poin</span>`
                            : `<span class="rank-change-delta-neg">${delta} poin</span>`;
                        const newPtsLabel = `${result.points} poin`;

                        const card = document.createElement('div');
                        card.className = 'rank-change-card';
                        card.innerHTML = `
                            <div class="rank-change-title">${title}</div>
                            <div class="rank-change-body">
                                <div class="rank-change-item">
                                    <img src="${rankImgSrc(oldName)}" class="rank-change-img" alt="${oldName}">
                                    <div>${oldName}</div>
                                    <div class="rank-pts-old">${oldPts} poin</div>
                                </div>
                                <div class="rank-change-arrow">${deltaHtml}<br>→</div>
                                <div class="rank-change-item">
                                    <img src="${rankImgSrc(result.rankName)}" class="rank-change-img" alt="${result.rankName}">
                                    <div>${result.rankName}</div>
                                    <div class="rank-pts-new">${newPtsLabel}</div>
                                </div>
                            </div>`;
                        rcContainer.appendChild(card);
                    };
                    if (_rankSnapshot) {
                        _showRankCard2(_rankSnapshot);
                    } else {
                        db.ref(`users/${currentUser.uid}/rankData`).get().then(snap => {
                            _showRankCard2(snap.exists() ? snap.val() : { rankName: 'Bronze III', points: 0 });
                        }).catch(() => {});
                    }
                }
            }
        }

        let goToHomeInProgress = false;
        /** Kembali ke halaman home: tutup semua modal, putar bgMusic, reset ke pre-loading screen */
        function _pingCategory(ms) {
            if (ms === null || ms === undefined) return { cls: 'ping-unknown', label: '— ms' };
            if (ms < 100)  return { cls: 'ping-kuat',   label: ms + ' ms' };
            if (ms < 200)  return { cls: 'ping-sedang', label: ms + ' ms' };
            return                 { cls: 'ping-lemah',  label: ms + ' ms' };
        }

        function updatePingPanel(pings) {
            const list = document.getElementById('ping-list');
            if (!list) return;

            // Tambahkan bot dengan ping simulasi ~99ms agar terlihat seperti pemain
            const allPings = [...pings];
            if (gameState && gameState.players) {
                gameState.players.forEach(p => {
                    if (p.isBot && !allPings.find(x => x.id === p.id)) {
                        const base = 88 + (p.id.charCodeAt(p.id.length - 1) % 22); // 88–110ms, stabil per bot
                        const jitter = Math.floor(Math.random() * 11) - 5;          // ±5ms variasi
                        allPings.push({ id: p.id, name: p.name, ping: base + jitter });
                    }
                });
            }

            list.innerHTML = '';
            allPings.forEach(p => {
                const { cls, label } = _pingCategory(p.ping);
                const item = document.createElement('div');
                item.className = 'ping-item';
                const isSelf = p.id === myPlayerId;
                item.innerHTML = `
                    <span class="ping-name">${isSelf ? '👤' : '👤'} ${p.name}${isSelf ? ' (Kamu)' : ''}</span>
                    <span class="ping-badge ${cls}">${label}</span>`;
                list.appendChild(item);
            });
        }

        function startPingMeasurement() {
            stopPingMeasurement();
            const sendPing = () => {
                if (!ws || ws.readyState !== 1) return;
                _pingTs = Date.now();
                try { ws.send(JSON.stringify({ type: 'CLIENT_PING', ts: _pingTs })); } catch(e) {}
            };
            sendPing();
            _pingInterval = setInterval(sendPing, 3000);
        }

        function stopPingMeasurement() {
            if (_pingInterval) { clearInterval(_pingInterval); _pingInterval = null; }
            const list = document.getElementById('ping-list');
            if (list) list.innerHTML = '';
        }

        function goToHome() {
            if (goToHomeInProgress) return; // guard double-click
            goToHomeInProgress = true;
            setTimeout(() => { goToHomeInProgress = false; }, 1000);

            // Cek apakah player menang mid-game (checkWin) tapi save belum dikonfirmasi.
            // Jika ya, perlu beri waktu lebih lama agar server selesai savePlayerStats()
            // sebelum WebSocket ditutup — sehingga STATS_SAVED / SAVE_STATS_CLIENT bisa diterima.
            let _pendingWinSave = false;
            if (!hasGameOverSaved && gameState && myPlayerId) {
                const me = gameState.players ? gameState.players.find(p => p.id === myPlayerId) : null;
                if (me && me.winner && me.rank > 0 && !me.isBot) {
                    _pendingWinSave = true; // server sedang simpan (checkWin) → beri waktu lebih
                }
            }

            // Stop ping measurement
            stopPingMeasurement();

            // Reset flag untuk pertandingan berikutnya
            hasGameOverSaved = false;
            pendingClientSaveRank = null; // reset untuk pertandingan berikutnya
            _isCustomRoom = false;
            _isSpectator = false;
            const _spBanner = document.getElementById('spectator-banner');
            if (_spBanner) _spBanner.style.display = 'none';

            // Bersihkan state lobby custom room (listener undangan masuk tetap aktif di home screen)
            _customInviteData = null;
            _customRoomId = null;
            _customRoomRole = null;
            _customRoomSlots = [];
            _customPickerSlot = null;
            _pendingCustomJoin = false;

            // Bersihkan state party (listener undangan masuk tetap aktif di home screen)
            // _partyStatusRef/_partyStatus2Ref adalah listener respons invite yang kamu kirim — tidak perlu aktif saat di home
            if (_partyStatusRef)  { _partyStatusRef.off();  _partyStatusRef  = null; }
            if (_partyStatus2Ref) { _partyStatus2Ref.off(); _partyStatus2Ref = null; }
            _partyInviteData  = null;
            _partyFriendUid   = null; _partyFriendName  = null;
            _partyFriend2Uid  = null; _partyFriend2Name = null;
            _partyQueueSize   = null;
            _partyId          = null;
            _stopPartyPresenceListener();
            _stopCustomPresenceListener();

            // Bersihkan semua timer dan handler force pick agar tidak bocor ke pertandingan berikutnya
            stopForcePickHeartbeat();
            if (autoForcePickTimer) { clearTimeout(autoForcePickTimer); autoForcePickTimer = null; }
            forcePickClickDebounce = false;
            // Hapus event listener force pick dari semua elemen kartu
            document.querySelectorAll('[data-card-id]').forEach(el => {
                if (el._forcePickHandler) {
                    el.removeEventListener('click', el._forcePickHandler);
                    el._forcePickHandler = null;
                }
            });
            // Bersihkan bgMusic2 first-click handler jika masih terdaftar
            if (window._bgMusic2FirstClickHandler) {
                document.removeEventListener('click', window._bgMusic2FirstClickHandler);
                window._bgMusic2FirstClickHandler = null;
            }

            // Tutup semua overlay/modal
            ['surrender-choice-modal', 'match-result-modal', 'game-over-modal'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('active');
            });

            // Hentikan bgMusic2 (musik game) jika masih berjalan
            try {
                soundEffects.bgMusic2.pause();
                soundEffects.bgMusic2.currentTime = 0;
            } catch(e) {}

            // Putar bgMusic (user gesture sudah terjadi karena klik tombol)
            // Dengan fallback autoplay policy
            try {
                soundEffects.bgMusic.currentTime = 0;
                soundEffects.bgMusic.play().catch(() => {
                    const onClick = function() {
                        soundEffects.bgMusic.play().catch(() => {});
                        document.removeEventListener('click', onClick);
                    };
                    document.addEventListener('click', onClick);
                });
            } catch(e) {}

            // Simpan ref ws & roomId sebelum di-null, lalu kirim LEAVE_MATCH ke server.
            // Jika ada pending win save (checkWin sedang proses), beri waktu 5 detik agar
            // server sempat mengirim STATS_SAVED / SAVE_STATS_CLIENT sebelum socket ditutup.
            // Jika tidak ada pending save (surrender sudah selesai), tutup setelah 200ms.
            const _ws = ws;
            const _roomId = currentRoomId;
            stopClientKeepAlive();
            ws = null; // null-kan segera agar tidak ada handler lain yang pakai
            // Putus handler segera agar pesan stale (GAME_OVER, GAME_STATE_UPDATE)
            // tidak masuk lagi selama jeda sebelum _ws.close() dieksekusi
            if (_ws) { _ws.onmessage = null; _ws.onclose = null; _ws.onerror = null; }
            _endGameShown = false; // reset untuk pertandingan berikutnya
            if (_ws && _ws.readyState === WebSocket.OPEN && _roomId) {
                try { _ws.send(JSON.stringify({ type: 'LEAVE_MATCH', roomId: _roomId })); } catch(e) {}
                const _closeDelay = _pendingWinSave ? 5000 : 200;
                setTimeout(() => { try { _ws.close(); } catch(e) {} }, _closeDelay);
            } else if (_ws) {
                try { _ws.close(); } catch(e) {}
            }

            // Reset semua state game
            currentRoomId = null;
            myPlayerId = null;
            gameState = null;
            deckInitialized = false;
            lsClear();
            Object.keys(botNameMap).forEach(k => delete botNameMap[k]);

            _setPresenceStatus('online');
            // Sembunyikan layar game & matchmaking
            DOM.gameContainer.classList.remove('active');
            DOM.matchmakingScreen.classList.remove('active');
            // Reset matchmaking UI ke idle
            const idle = DOM.matchmakingScreen.querySelector('#matchmaking-idle');
            const waiting = DOM.matchmakingScreen.querySelector('#matchmaking-waiting');
            const starting = DOM.matchmakingScreen.querySelector('#match-starting');
            if (idle) idle.style.display = 'flex';
            if (waiting) waiting.style.display = 'none';
            if (starting) starting.style.display = 'none';
            DOM.matchmakingScreen.style.justifyContent = 'flex-end';

            // Sembunyikan pre-loading screen, tampilkan matchmaking-screen (layar utama)
            const preScreen = document.getElementById('pre-loading-screen');
            preScreen.style.display = 'none';
            preScreen.classList.remove('hidden');
            DOM.matchmakingScreen.classList.add('active');
            document.getElementById('profile-badge').style.display = 'block';
        }

        // =============================================
        // UI UPDATE FUNCTIONS
        // =============================================
        function updateUI() {
            if (!gameState) return;
            // Spectator mode: show a simplified view
            if (_isSpectator || !myPlayerId) {
                if (_isSpectator && gameState.players) {
                    _renderSpectatorView();
                }
                return;
            }
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;

            // Stats
            document.getElementById('round-number').textContent = gameState.round || 1;
            document.getElementById('phase-name').textContent = gameState.phase || 1;
            document.getElementById('draw-pile-count-2').textContent = gameState.drawPile ? gameState.drawPile.length : 0;
            document.getElementById('discard-pile-count-2').textContent = gameState.discardPile ? gameState.discardPile.length : 0;

            // Province label
            const provinceLabel = document.getElementById('province-label');
            provinceLabel.innerHTML = gameState.currentProvince ? `<img src="${av(`gambar/provinsi/${gameState.currentProvince}/peta (${gameState.currentProvince}).png`)}" alt="Peta" class="province-label-map" onerror="this.style.display='none'"> ${gameState.currentProvince}` : 'Menunggu kartu...';

            // Province info button
            const infoBtn = document.getElementById('province-info-btn');
            infoBtn.style.display = gameState.currentProvince ? 'flex' : 'none';
            if (!infoBtn._listenerAdded) {
                infoBtn.addEventListener('click', () => { playSound('button'); showProvinceInfo(); });
                infoBtn._listenerAdded = true;
            }

            // Refresh button listener
            const refreshBtn = document.getElementById('sync-refresh-btn');
            if (!refreshBtn._listenerAdded) {
                refreshBtn.addEventListener('click', () => { playSound('button'); syncRefresh(); });
                refreshBtn._listenerAdded = true;
            }

            // Close province info modal
            const closeBtn = document.getElementById('province-info-close');
            if (!closeBtn._listenerAdded) {
                closeBtn.addEventListener('click', () => { playSound('button'); closeProvinceInfo(); });
                closeBtn._listenerAdded = true;
            }

            // Turn notification
            const notification = document.getElementById('player-turn-notification');
            const hasMatchingCard = player.hand.some(c => c.province === gameState.currentProvince);
            const notifText = document.getElementById('player-turn-notification-text');
            if (gameState.forcePickProcessing || player.mustForcePick) {
                notification.style.display = 'none';
            } else if (gameState.phase === 1 && gameState.phase1Player === player.id && !player.hasPlayed) {
                notifText.textContent = '✅ Pilih Bebas kartu di bawah';
                notification.style.display = 'block';
            } else if (gameState.phase === 2 && !player.hasPlayed && !player.mustDraw && !player.mustForcePick && hasMatchingCard) {
                notifText.textContent = '✅ Pilih kartu di bawah';
                notification.style.display = 'block';
            } else {
                notification.style.display = 'none';
            }

            updateTopCardsUI();
            updatePlayerUI();
            updateBotsUI();
            updateButtons();
        }

        function updateTopCardsUI() {
            if (!gameState || !gameState.topCard) return;
            const topCardsDiv = document.getElementById('top-cards');
            if (!topCardsDiv) return;
            const player = gameState.players.find(p => p.id === myPlayerId);

            // Remove cards no longer in topCard
            if (gameState.topCard.length === 0) {
                Array.from(topCardsDiv.children).forEach(el => {
                    if (!el.classList.contains('zoom-out')) {
                        el.classList.add('zoom-out');
                        playSound('zoomOut');
                        setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
                    }
                });
                return;
            }

            const currentIds = gameState.topCard.map(c => c.id);
            Array.from(topCardsDiv.children).forEach(el => {
                if (!currentIds.includes(el.dataset.cardId) && !el.classList.contains('zoom-out')) {
                    el.classList.add('zoom-out');
                    playSound('zoomOut');
                    setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
                }
            });

            // Add new cards
            gameState.topCard.forEach(card => {
                let existing = topCardsDiv.querySelector(`[data-card-id="${card.id}"]`);
                if (!existing) {
                    const cardEl = createCardElement(card);
                    cardEl.classList.add('locked');
                    cardEl.style.cursor = 'not-allowed';
                    topCardsDiv.appendChild(cardEl);

                    requestAnimationFrame(() => {
                        cardEl.classList.add('zoom-in');
                        playSound('zoomIn');
                    });

                    setTimeout(() => {
                        cardEl.classList.remove('zoom-in');
                        if (gameState.forcePickMode && player && gameState.forcePickPlayers.some(p => p.id === player.id) && !player.hasPlayed) {
                            setTimeout(() => enableForcePickInteraction(), 100);
                        }
                    }, 450);
                } else {
                    // Update interactivity on existing card
                    if (gameState.forcePickMode && player && gameState.forcePickPlayers.some(p => p.id === player.id) && !player.hasPlayed) {
                        setTimeout(() => enableForcePickInteraction(), 100);
                    } else {
                        existing.classList.remove('selectable');
                        existing.classList.add('locked');
                        existing.style.cursor = 'not-allowed';
                        if (existing._forcePickHandler) {
                            existing.removeEventListener('click', existing._forcePickHandler);
                        }
                        existing.onclick = null;
                    }
                }
            });
        }

        function updatePlayerUI() {
            if (!gameState || !myPlayerId) return;
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;

            const rankBadge = player.winner
                ? ` <span style="font-size:0.6em; background:rgba(255,210,0,0.2); border:1px solid rgba(255,210,0,0.6); border-radius:12px; padding:2px 10px; color:#ffd200; vertical-align:middle; white-space:nowrap;">🏆#${player.rank}</span>`
                : '';
            document.getElementById('player-header-name').innerHTML = `👤 ${player.name}${rankBadge}`;
            document.getElementById('player-cards').textContent = player.hand.length;
            document.getElementById('player-power').textContent = player.totalPower || 0;

            const deckDiv = document.getElementById('player-deck');
            const sortedHand = [...player.hand].sort((a, b) => b.power - a.power);
            const newIds = sortedHand.map(c => c.id);

            // 1. Hapus slot yang kartunya sudah tidak ada di tangan
            Array.from(deckDiv.children).forEach(el => {
                const slotId = el.dataset.slotId ?? el.dataset.cardId;
                const cardInside = el.querySelector?.('.card') ?? el;
                if (!newIds.includes(slotId)
                    && !el.classList.contains('zoom-out')
                    && !cardInside.classList.contains('fly-to-top')
                    && !cardInside.classList.contains('zoom-out')) {
                    el.classList.add('zoom-out');
                    if (deckInitialized) playSound('zoomOut');
                    setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
                }
            });

            // 2. Tambah kartu baru & update interaktivitas
            sortedHand.forEach(card => {
                let slot = deckDiv.querySelector(`.deck-slot[data-slot-id="${card.id}"]`);
                let existing; // elemen .card di dalam slot
                if (!slot) {
                    slot = document.createElement('div');
                    slot.className = 'deck-slot';
                    slot.dataset.slotId = card.id;
                    const cardEl = createCardElement(card);
                    slot.appendChild(cardEl);
                    const lbl = document.createElement('div');
                    lbl.className = 'deck-province-label' + (_showDeckProvinceLabel ? '' : ' hidden');
                    lbl.textContent = card.province || '';
                    slot.appendChild(lbl);
                    deckDiv.appendChild(slot);
                    slot.classList.add('zoom-in');
                    if (deckInitialized) playSound('zoomIn');
                    setTimeout(() => slot.classList.remove('zoom-in'), 400);
                    existing = cardEl;
                } else {
                    existing = slot.querySelector('.card');
                    // Sinkronkan visibilitas label
                    const lbl = slot.querySelector('.deck-province-label');
                    if (lbl) lbl.classList.toggle('hidden', !_showDeckProvinceLabel);
                }

                // 3. Update interaktivitas
                const isPhase1Turn = gameState.phase === 1 && gameState.phase1Player === player.id && !player.hasPlayed && !player.isProcessingAction;
                const isPhase2Turn = gameState.phase === 2 && !player.hasPlayed && !player.mustDraw && !player.mustForcePick && !player.isProcessingAction;
                const matchesProvince = card.province === gameState.currentProvince;

                const shouldBeSelectable = (isPhase1Turn) || (isPhase2Turn && matchesProvince);
                const alreadySelectable = existing.classList.contains('selectable');

                if (!shouldBeSelectable) {
                    existing.classList.remove('selectable', 'disabled', 'locked');
                    existing.onclick = null;
                }

                if (isPhase1Turn) {
                    if (!alreadySelectable) existing.classList.add('selectable');
                    existing.classList.remove('disabled', 'locked');
                    existing.style.cursor = 'pointer';
                    existing.onclick = (e) => { e.stopPropagation(); playerPlayPhase1(card); };
                } else if (isPhase2Turn && matchesProvince) {
                    if (!alreadySelectable) existing.classList.add('selectable');
                    existing.classList.remove('disabled', 'locked');
                    existing.style.cursor = 'pointer';
                    existing.onclick = (e) => { e.stopPropagation(); playerPlayCard(card); };
                } else if (isPhase2Turn && !matchesProvince) {
                    existing.classList.add('disabled');
                    existing.style.cursor = 'not-allowed';
                    existing.onclick = (e) => {
                        e.stopPropagation();
                        addLog(`❌ ${card.name} bukan dari provinsi ${gameState.currentProvince}!`);
                        existing.classList.add('shake');
                        setTimeout(() => existing.classList.remove('shake'), 300);
                    };
                } else {
                    existing.classList.add('disabled');
                    existing.style.cursor = 'default';
                    existing.onclick = (e) => {
                        e.stopPropagation();
                        if (player.hasPlayed) addLog('❌ Anda sudah bermain di ronde ini!');
                        else if (player.mustDraw) addLog('❌ Anda harus Draw Card terlebih dahulu!');
                        else if (player.mustForcePick) addLog('⏳ Tunggu proses Ambil Kartu selesai!');
                        else addLog('❌ Kartu tidak bisa dimainkan saat ini!');
                    };
                }
            });

            // 4. Fix urutan slot sesuai sortedHand
            sortedHand.forEach(card => {
                const slot = deckDiv.querySelector(`.deck-slot[data-slot-id="${card.id}"]`);
                if (slot) deckDiv.appendChild(slot);
            });

            // 5. Penalty & Freed notifications
            const penalty = document.getElementById('player-penalty');
            const penaltyText = document.getElementById('penalty-text');
            const freedNotif = document.getElementById('player-freed-notification');
            const topCardsDiv = document.getElementById('top-cards');
            const hasClickableCards = topCardsDiv.querySelector('.card.selectable') !== null;

            if (player.hasPlayed) {
                penalty.style.display = 'none';
            } else if (player.freed && gameState.phase === 2) {
                penalty.style.display = 'none';
            } else if (player.mustForcePick && !player.freed && hasClickableCards) {
                penalty.style.display = 'block';
                penaltyText.textContent = '⚠️ Ambil Kartu Di Atas';
            } else if (player.mustDraw) {
                penalty.style.display = 'block';
                penaltyText.textContent = '⚠️ Anda harus draw card';
            } else {
                penalty.style.display = 'none';
            }

            if (player.freed && gameState.phase === 2 && !gameState.forcePickProcessing) {
                freedNotif.style.display = 'block';
            } else {
                freedNotif.style.display = 'none';
            }

            deckInitialized = true; // ← selalu di paling akhir
        }
		
        function updateBotsUI() {
            if (!gameState) return;
            const panel = document.getElementById('opponents-panel');
            const title = panel.querySelector('.opponents-title');
    
            // Hapus opponent items lama
            panel.querySelectorAll('.opponent-item').forEach(el => el.remove());

            gameState.players.forEach(p => {
                if (p.id === myPlayerId) return;
                const div = document.createElement('div');
                const isDone = p.hasPlayed || p.winner;
                const isFP = p.mustForcePick;
                div.className = `opponent-item ${isDone ? 'active' : ''} ${isFP ? 'warning' : ''} human-player`;
                div.innerHTML = `
                    <div class="opponent-name">
                        <span class="status-dot ${isDone ? 'done' : 'waiting'}"></span>
                        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;">👤 ${getBotDisplayName(p)}${p.winner ? ` 🏆#${p.rank}` : ''}</span>
                    </div>
                    <div class="opponent-stats">
                        <div class="stat-badge">📇 ${p.hand ? p.hand.length : 0}</div>
                        <div class="stat-badge">⚡ ${p.totalPower || 0}</div>
                    </div>
                `;
                panel.appendChild(div);
            });
        }

        function updateButtons() {
            if (!gameState || !myPlayerId) return;
            const player = gameState.players.find(p => p.id === myPlayerId);
            if (!player) return;

            const btnDraw       = document.getElementById('btn-draw');
            const btnSurrender  = document.getElementById('btn-surrender');
            const btnShowResult = document.getElementById('btn-show-result');

            btnDraw.disabled = !player.mustDraw || player.hasPlayed;
            btnDraw.onclick  = player.mustDraw ? playerDrawCard : null;

            if (player.winner) {
                // Sudah selesai (menang atau menyerah) → sembunyikan surrender, tampilkan hasil
                if (btnSurrender)  { btnSurrender.style.display  = 'none'; }
                if (btnShowResult) { btnShowResult.style.display = 'inline-block'; }
            } else {
                if (btnSurrender)  { btnSurrender.style.display  = 'inline-block'; }
                if (btnShowResult) { btnShowResult.style.display = 'none'; }
            }
        }

        // Pre-loading dimulai setelah login (lihat onAuthAndNicknameReady)

        function doSurrender() {
            // Guard 1: pastikan ada room dan WebSocket benar-benar terbuka
            if (!currentRoomId || !ws || ws.readyState !== WebSocket.OPEN) {
                addLog('❌ Tidak bisa menyerah: koneksi ke server terputus.');
                return;
            }
            // Guard 2: cegah jika player sudah winner (misal double-click cepat)
            if (gameState && myPlayerId) {
                const p = gameState.players.find(p => p.id === myPlayerId);
                if (p && p.winner) return;
            }

            if (!confirm('🏳️ Yakin ingin menyerah?\n\nKartu yang kamu miliki akan masuk ke tumpukan terpakai.\nKamu akan mendapat peringkat terakhir yang tersedia.')) return;

            // Disable tombol langsung agar tidak bisa diklik 2x
            const btn = document.getElementById('btn-surrender');
            if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }

            // Kirim ke server dengan try/catch agar error koneksi tidak meledak
            try {
                ws.send(JSON.stringify({
                    type: 'SURRENDER',
                    roomId: currentRoomId
                }));
                addLog('🏳️ Kamu menyerah...');
            } catch(e) {
                addLog('❌ Gagal mengirim surrender: koneksi terputus. Coba lagi.');
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
                return;
            }

            // Tampilkan pilihan: lanjut menonton atau lihat hasil
            setTimeout(() => {
                document.getElementById('surrender-choice-modal').classList.add('active');
            }, 600);
        }

        function startClientKeepAlive() {
            if (clientKeepAliveInterval) clearInterval(clientKeepAliveInterval);
            clientKeepAliveInterval = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    try { ws.send(JSON.stringify({ type: 'PONG' })); } catch(e) {}
                } else {
                    stopClientKeepAlive();
                }
            }, 20000);
        }

        function stopClientKeepAlive() {
            if (clientKeepAliveInterval) {
                clearInterval(clientKeepAliveInterval);
                clientKeepAliveInterval = null;
            }
        }

        // ============================================================
        // ENSIKLOPEDIA
        // ============================================================
        function showEncyclopedia() {
            document.getElementById('encyclopedia-screen').style.display = 'block';
            document.body.style.overflow = 'hidden';
            renderEncFilter();
            renderEncCards('Semua');
        }

        function hideEncyclopedia() {
            document.getElementById('encyclopedia-screen').style.display = 'none';
            restoreBodyOverflow();
        }

        // =============================================
        // PROFILE SCREEN
        // =============================================
        function showProfileScreen() {
            document.getElementById('profile-screen').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            attachProfileListeners(); // pasang real-time listeners
            switchProfileTab('profil');
        }

        function hideProfileScreen() {
            document.getElementById('profile-screen').style.display = 'none';
            restoreBodyOverflow();
            detachProfileListeners(); // lepas listener saat tutup
        }

        function showTemanScreen() {
            document.getElementById('teman-screen').style.display = 'block';
            document.body.style.overflow = 'hidden';
            loadFriendsTab();
        }

        function hideTemanScreen() {
            document.getElementById('teman-screen').style.display = 'none';
            restoreBodyOverflow();
        }

        function switchProfileTab(tab) {
            ['profil', 'statistik', 'riwayat'].forEach(t => {
                document.getElementById(`btn-tab-${t}`).classList.toggle('active', t === tab);
                document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
            });
            // Re-fetch dari Firebase setiap kali tab dibuka agar data selalu fresh
            if (tab === 'profil')         loadProfileData();
            else if (tab === 'statistik') loadProfileStats();
            // riwayat: data sudah dihandle oleh real-time listener di attachProfileListeners()
        }

        function loadProfileData() {
            if (!currentUser) return;
            document.getElementById('prf-nickname').textContent = currentNickname || '-';
            document.getElementById('prf-id').textContent = `#${currentUser.uid.slice(-6).toUpperCase()}`;
            db.ref(`users/${currentUser.uid}/createdAt`).get().then(snap => {
                if (snap.exists()) {
                    const d = new Date(snap.val());
                    document.getElementById('prf-joined').textContent =
                        d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                } else {
                    document.getElementById('prf-joined').textContent = '-';
                }
            }).catch(() => {});
            // Load rank data
            db.ref(`users/${currentUser.uid}/rankData`).get().then(snap => {
                const r = snap.exists() ? snap.val() : { rankName: 'Bronze III', points: 0, peakRank: 'Bronze III' };
                const rankName = r.rankName || 'Bronze III';
                const points   = r.points   || 0;
                const peakRank  = r.peakRank      || 'Bronze III';
                // Jika peakRank == rankSaatIni, poin tertinggi minimal sama dengan poin saat ini
                const peakPts   = peakRank === rankName
                    ? Math.max(r.peakRankPoints || 0, points)
                    : (r.peakRankPoints || 0);
                const isMax     = rankName === 'Platinum MAX';
                _cachedRankName = rankName;
                document.getElementById('prf-rank-img').src    = rankImgSrc(rankName);
                document.getElementById('prf-rank-img').alt    = rankName;
                document.getElementById('prf-rank-name').textContent   = rankName;
                document.getElementById('prf-rank-points').textContent = isMax ? `${points} poin` : `${points} / 100 poin`;
                document.getElementById('prf-peak-img').src    = rankImgSrc(peakRank);
                document.getElementById('prf-peak-img').alt    = peakRank;
                document.getElementById('prf-peak-name').textContent  = peakRank;
                document.getElementById('prf-peak-points').textContent = `${peakPts} poin`;
                updateProfileAvatar();
            }).catch(() => {});
        }

        function loadProfileStats() {
            if (!currentUser) return;
            db.ref(`users/${currentUser.uid}/stats`).get().then(snap => {
                const s = snap.exists() ? snap.val() : { totalMatches: 0, rank1: 0, rank2: 0, rank3: 0, rank4: 0 };
                const total = s.totalMatches || 0;
                const pct = n => total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%';
                const totalWins = (s.rank1 || 0) + (s.rank2 || 0) + (s.rank3 || 0);
                document.getElementById('stat-total').textContent = total;
                document.getElementById('stat-wins').textContent = totalWins;
                document.getElementById('stat-losses').textContent = s.rank4 || 0;
                document.getElementById('stat-winrate').textContent = pct(totalWins);
                document.getElementById('stat-p1').textContent = pct(s.rank1 || 0);
                document.getElementById('stat-p2').textContent = pct(s.rank2 || 0);
                document.getElementById('stat-p3').textContent = pct(s.rank3 || 0);
                document.getElementById('stat-p4').textContent = pct(s.rank4 || 0);
            }).catch(() => {});
        }

        function loadProfileHistory() {
            if (!currentUser) return;
            const listEl = document.getElementById('history-list');
            listEl.innerHTML = '<div class="profile-empty">Memuat riwayat...</div>';
            db.ref(`users/${currentUser.uid}/history`).orderByKey().limitToLast(10).get().then(snap => {
                if (!snap.exists()) {
                    listEl.innerHTML = '<div class="profile-empty">Belum ada riwayat pertandingan.</div>';
                    return;
                }
                const medals = { 1: '🥇 Juara 1', 2: '🥈 Juara 2', 3: '🥉 Juara 3', 4: '💀 Juara 4' };
                const items = [];
                snap.forEach(child => items.push(child.val()));
                items.reverse();
                listEl.innerHTML = items.map((m, i) => {
                    const d = new Date(m.date);
                    const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const pts = m.ptsChange;
                    const ptsHtml = pts == null ? '' :
                        `<span class="phi-pts ${pts > 0 ? 'plus' : pts < 0 ? 'minus' : 'zero'}">${pts > 0 ? '+' : ''}${pts} poin</span>`;
                    const rankRowHtml = (m.rankBefore && m.rankAfter)
                        ? `<div class="phi-rank-row">
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankBefore)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankBefore}</span>
                                <span class="phi-rank-pts">${m.ptsBefore != null ? m.ptsBefore : 0} poin</span>
                            </div>
                            <span class="phi-arrow">→</span>
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankAfter)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankAfter}</span>
                                <span class="phi-rank-pts">${m.ptsAfter != null ? m.ptsAfter : 0} poin</span>
                            </div>
                            <span class="phi-date">${tanggal}</span>
                          </div>`
                        : `<span class="phi-date">${tanggal}</span>`;
                    return `<div class="profile-history-item">
                        <div class="phi-header">
                            <span class="phi-result">${i + 1}. ${medals[m.rank] || `Juara ${m.rank}`}</span>
                            ${ptsHtml}
                        </div>
                        ${rankRowHtml}
                    </div>`;
                }).join('');
            }).catch(() => {
                listEl.innerHTML = '<div class="profile-empty">Gagal memuat riwayat.</div>';
            });
        }

        // =============================================
        // SETTINGS SCREEN
        // =============================================
        // Rasio volume SFX default (relatif antar suara)
        const SFX_KEYS = ['zoomIn', 'zoomOut', 'forcePick', 'drawCard', 'x', 'button'];
        const SFX_BASE = { zoomIn: 0.5, zoomOut: 0.5, forcePick: 0.6, drawCard: 0.5, x: 0.5, button: 0.5 };
        // Slider master SFX (0-100) → skala ke volume masing-masing dengan rasio base
        const SFX_MAX = Math.max(...Object.values(SFX_BASE)); // 0.6

        // Muat volume tersimpan dari localStorage (jika ada)
        (function() {
            const v1  = localStorage.getItem('cgn_vol_bgmusic1');
            const v2  = localStorage.getItem('cgn_vol_bgmusic2');
            const sfx = localStorage.getItem('cgn_vol_sfx');
            if (v1  !== null) soundEffects.bgMusic.volume  = parseInt(v1)  / 100;
            if (v2  !== null) soundEffects.bgMusic2.volume = parseInt(v2)  / 100;
            if (sfx !== null) {
                const master = parseInt(sfx) / 100;
                SFX_KEYS.forEach(k => { soundEffects[k].volume = master * (SFX_BASE[k] / SFX_MAX); });
            }
        })();

        // =============================================
        // PROVINCE TOOLTIP FEATURE
        // =============================================
        let _showProvinceTooltip    = lsGet(LS.PROVINCE_TOOLTIP)    === '1'; // default: off
        let _showDeckProvinceLabel  = lsGet(LS.DECK_PROVINCE_LABEL) === '1'; // default: off

        function applyDeckProvinceLabelSetting(enabled) {
            _showDeckProvinceLabel = enabled;
            lsSet(LS.DECK_PROVINCE_LABEL, enabled ? '1' : '0');
            [document.getElementById('toggle-deck-province-label'),
             document.getElementById('igs-toggle-deck-province-label')]
                .forEach(t => { if (t) t.checked = enabled; });
            // Update semua label yang sudah ada di DOM
            document.querySelectorAll('#player-deck .deck-province-label').forEach(lbl => {
                lbl.classList.toggle('hidden', !enabled);
            });
        }

        // Buat elemen tooltip sekali, reuse untuk semua kartu
        const _provinceTooltipEl = document.createElement('div');
        _provinceTooltipEl.id = 'province-tooltip';
        document.body.appendChild(_provinceTooltipEl);

        function applyProvinceTooltipSetting(enabled) {
            _showProvinceTooltip = enabled;
            lsSet(LS.PROVINCE_TOOLTIP, enabled ? '1' : '0');
            [document.getElementById('toggle-province-tooltip'),
             document.getElementById('igs-toggle-province-tooltip')]
                .forEach(t => { if (t) t.checked = enabled; });
            if (!enabled) _provinceTooltipEl.classList.remove('visible');
        }

        // Event delegation: satu listener untuk semua kartu (termasuk yang dibuat dinamis)
        document.addEventListener('mouseover', (e) => {
            if (!_showProvinceTooltip) return;
            const card = e.target.closest('.card[data-province]');
            if (!card) return;
            const province = card.dataset.province;
            if (!province) return;
            const rect = card.getBoundingClientRect();
            _provinceTooltipEl.textContent = province;
            _provinceTooltipEl.style.left = (rect.left + rect.width / 2) + 'px';
            _provinceTooltipEl.style.top  = (rect.top - 10) + 'px';
            _provinceTooltipEl.classList.add('visible');
        });

        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.card[data-province]');
            if (!card) return;
            _provinceTooltipEl.classList.remove('visible');
        });

        // Sembunyikan tooltip saat scroll (agar tidak "mengambang" di posisi lama)
        document.addEventListener('scroll', () => {
            _provinceTooltipEl.classList.remove('visible');
        }, true);

        // =============================================
        // IN-GAME SETTINGS
        // =============================================
        function syncIngameSettings() {
            const v1   = Math.round(soundEffects.bgMusic.volume * 100);
            const v2   = Math.round(soundEffects.bgMusic2.volume * 100);
            const vSfx = Math.round((soundEffects.zoomIn.volume / SFX_MAX) * 100);
            const s1 = document.getElementById('igs-vol-bgmusic1');
            const s2 = document.getElementById('igs-vol-bgmusic2');
            const sSfx = document.getElementById('igs-vol-sfx');
            if (s1)   { s1.value   = v1;   document.getElementById('igs-vol-bgmusic1-val').textContent = v1   + '%'; }
            if (s2)   { s2.value   = v2;   document.getElementById('igs-vol-bgmusic2-val').textContent = v2   + '%'; }
            if (sSfx) { sSfx.value = vSfx; document.getElementById('igs-vol-sfx-val').textContent     = vSfx + '%'; }
            const t1 = document.getElementById('igs-toggle-province-tooltip');
            const t2 = document.getElementById('igs-toggle-deck-province-label');
            if (t1) t1.checked = _showProvinceTooltip;
            if (t2) t2.checked = _showDeckProvinceLabel;
        }

        function toggleIngameSettings() {
            const panel = document.getElementById('ingame-settings-panel');
            if (panel.style.display === 'none' || panel.style.display === '') {
                syncIngameSettings();
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        }

        function closeIngameSettings() {
            document.getElementById('ingame-settings-panel').style.display = 'none';
        }

        // Tutup panel saat klik di luar area panel/tombol
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('ingame-settings-panel');
            const btn   = document.getElementById('btn-ingame-settings');
            if (!panel || panel.style.display === 'none') return;
            if (!panel.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
                panel.style.display = 'none';
            }
        });

        function showSettingsScreen() {
            // Tampilkan email akun
            if (currentUser) {
                document.getElementById('settings-email').textContent = currentUser.email || '-';
            }
            // Sinkronkan slider dengan volume saat ini
            const v1 = Math.round(soundEffects.bgMusic.volume * 100);
            const v2 = Math.round(soundEffects.bgMusic2.volume * 100);
            const vSfx = Math.round((soundEffects.zoomIn.volume / SFX_MAX) * 100);
            document.getElementById('vol-bgmusic1').value = v1;
            document.getElementById('vol-bgmusic1-val').textContent = v1 + '%';
            document.getElementById('vol-bgmusic2').value = v2;
            document.getElementById('vol-bgmusic2-val').textContent = v2 + '%';
            document.getElementById('vol-sfx').value = vSfx;
            document.getElementById('vol-sfx-val').textContent = vSfx + '%';
            // Sinkronkan toggle tooltip provinsi & label deck
            const toggleTip = document.getElementById('toggle-province-tooltip');
            if (toggleTip) toggleTip.checked = _showProvinceTooltip;
            const toggleLbl = document.getElementById('toggle-deck-province-label');
            if (toggleLbl) toggleLbl.checked = _showDeckProvinceLabel;
            document.getElementById('settings-screen').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function hideSettingsScreen() {
            document.getElementById('settings-screen').style.display = 'none';
            restoreBodyOverflow();
        }

        function showPengembangScreen() {
            document.getElementById('pengembang-screen').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function hidePengembangScreen() {
            document.getElementById('pengembang-screen').style.display = 'none';
            restoreBodyOverflow();
        }

        function applyVolumeBgMusic1(val) {
            const v = parseInt(val) / 100;
            soundEffects.bgMusic.volume = v;
            localStorage.setItem('cgn_vol_bgmusic1', val);
            document.getElementById('vol-bgmusic1-val').textContent = val + '%';
            const s = document.getElementById('igs-vol-bgmusic1'); if (s) s.value = val;
            const sv = document.getElementById('igs-vol-bgmusic1-val'); if (sv) sv.textContent = val + '%';
        }

        function applyVolumeBgMusic2(val) {
            const v = parseInt(val) / 100;
            soundEffects.bgMusic2.volume = v;
            localStorage.setItem('cgn_vol_bgmusic2', val);
            document.getElementById('vol-bgmusic2-val').textContent = val + '%';
            const s = document.getElementById('igs-vol-bgmusic2'); if (s) s.value = val;
            const sv = document.getElementById('igs-vol-bgmusic2-val'); if (sv) sv.textContent = val + '%';
        }

        function applyVolumeSfx(val) {
            const master = parseInt(val) / 100;
            SFX_KEYS.forEach(k => {
                soundEffects[k].volume = master * (SFX_BASE[k] / SFX_MAX);
            });
            localStorage.setItem('cgn_vol_sfx', val);
            document.getElementById('vol-sfx-val').textContent = val + '%';
            const s = document.getElementById('igs-vol-sfx'); if (s) s.value = val;
            const sv = document.getElementById('igs-vol-sfx-val'); if (sv) sv.textContent = val + '%';
        }

        async function saveMatchResult(myRank) {
            if (!currentUser || !myRank) return;
            try {
                const uid = currentUser.uid;
                const statsRef = db.ref(`users/${uid}/stats`);
                await statsRef.transaction(s => {
                    if (!s) s = { totalMatches: 0, rank1: 0, rank2: 0, rank3: 0, rank4: 0 };
                    s.totalMatches = (s.totalMatches || 0) + 1;
                    s[`rank${myRank}`] = (s[`rank${myRank}`] || 0) + 1;
                    return s;
                });
                // Ambil rankData dulu agar bisa catat perubahan ke history
                let _rankBefore = 'Bronze III', _rankAfter = 'Bronze III', _ptsChange = 0, _ptsBefore = 0, _ptsAfter = 0;
                await db.ref(`users/${uid}/rankData`).transaction(r => {
                    if (!r) r = { rankName: 'Bronze III', points: 0, peakRank: 'Bronze III', peakRankIndex: 0 };
                    _rankBefore = r.rankName || 'Bronze III';
                    _ptsBefore  = r.points   || 0;
                    const tier  = getRankTier(_rankBefore);
                    _ptsChange  = RANK_CHANGES[tier][myRank - 1];
                    const result = calculateNewRank(_rankBefore, _ptsBefore, myRank);
                    _rankAfter = result.rankName;
                    _ptsAfter  = result.points;
                    r.rankName = result.rankName;
                    r.points   = result.points;
                    const newIdx = RANKS.indexOf(result.rankName);
                    if (newIdx > (r.peakRankIndex || 0)) {
                        r.peakRank       = result.rankName;
                        r.peakRankIndex  = newIdx;
                        r.peakRankPoints = result.points;
                    } else if (result.rankName === r.peakRank && result.points > (r.peakRankPoints || 0)) {
                        r.peakRankPoints = result.points;
                    }
                    return r;
                });
                await db.ref(`users/${uid}/history`).push({
                    rank: myRank, date: Date.now(),
                    rankBefore: _rankBefore, rankAfter: _rankAfter,
                    ptsBefore: _ptsBefore, ptsAfter: _ptsAfter, ptsChange: _ptsChange
                });
            } catch (e) {
            }
        }

        // =============================================
        // FRIEND SYSTEM
        // =============================================

        function escHtml(str) {
            return String(str)
                .replace(/&/g,'&amp;').replace(/</g,'&lt;')
                .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // Cari pemain berdasarkan nama atau ID pendek
        async function searchPlayers() {
            if (!currentUser) return;
            const query = (document.getElementById('friend-search-input').value || '').trim().toLowerCase();
            const resultsEl = document.getElementById('friend-search-results');
            if (!query) { resultsEl.innerHTML = ''; return; }

            resultsEl.innerHTML = '<div class="friend-pending">⏳ Mencari...</div>';
            try {
                const [myFriendsSnap, mySentSnap] = await Promise.all([
                    db.ref(`users/${currentUser.uid}/friends`).get(),
                    db.ref(`users/${currentUser.uid}/friendRequests/sent`).get()
                ]);
                const myFriends = myFriendsSnap.exists() ? Object.keys(myFriendsSnap.val()) : [];
                const mySent    = mySentSnap.exists()    ? Object.keys(mySentSnap.val())    : [];

                const allSnap = await db.ref('users').get();
                if (!allSnap.exists()) {
                    resultsEl.innerHTML = '<div class="friend-pending">Tidak ada pemain ditemukan.</div>';
                    return;
                }

                const results = [];
                allSnap.forEach(child => {
                    const uid  = child.key;
                    if (uid === currentUser.uid) return;
                    const data = child.val();
                    if (!data || !data.nickname) return;
                    const nick    = data.nickname.toLowerCase();
                    const shortId = uid.slice(-6).toLowerCase();
                    const qClean  = query.replace(/^#/, '');
                    if (nick.includes(qClean) || shortId.includes(qClean)) {
                        results.push({ uid, nickname: data.nickname, shortId: uid.slice(-6).toUpperCase() });
                    }
                });

                if (results.length === 0) {
                    resultsEl.innerHTML = '<div class="friend-pending">Tidak ada pemain ditemukan.</div>';
                    return;
                }

                resultsEl.innerHTML = results.slice(0, 10).map(p => {
                    const isFriend  = myFriends.includes(p.uid);
                    const isPending = mySent.includes(p.uid);
                    let actionBtn = '';
                    if (isFriend) {
                        actionBtn = `<button class="btn-fa btn-fa-sent" disabled>✅ Teman</button>`;
                    } else if (isPending) {
                        actionBtn = `<button class="btn-fa btn-fa-sent" disabled>⏳ Terkirim</button>`;
                    } else {
                        actionBtn = `<button class="btn-fa btn-fa-add" onclick="playSound('button');sendFriendRequest('${p.uid}','${p.nickname.replace(/'/g,"\\'")}',this)">➕ Tambah</button>`;
                    }
                    return `
                    <div class="friend-card">
                        <div class="friend-avatar">${escHtml(p.nickname.charAt(0).toUpperCase())}</div>
                        <div class="friend-info">
                            <div class="friend-name">${escHtml(p.nickname)}</div>
                            <div class="friend-id">#${p.shortId}</div>
                        </div>
                        <div class="friend-actions">
                            <button class="btn-fa btn-fa-visit" onclick="playSound('button');visitPlayerProfile('${p.uid}')">🌿 Kunjungi</button>
                            ${actionBtn}
                        </div>
                    </div>`;
                }).join('');

            } catch(e) {
                resultsEl.innerHTML = '<div class="friend-pending">❌ Gagal mencari pemain.</div>';
            }
        }

        // Kirim permintaan teman
        async function sendFriendRequest(targetUid, targetNickname, btn) {
            if (!currentUser) return;
            try {
                const senderNick = currentNickname || 'Player';
                await Promise.all([
                    db.ref(`users/${currentUser.uid}/friendRequests/sent/${targetUid}`)
                        .set({ nickname: targetNickname, timestamp: Date.now() }),
                    db.ref(`users/${targetUid}/friendRequests/received/${currentUser.uid}`)
                        .set({ nickname: senderNick, timestamp: Date.now() })
                ]);
                if (btn) {
                    btn.textContent = '⏳ Terkirim';
                    btn.className = 'btn-fa btn-fa-sent';
                    btn.disabled = true;
                }
            } catch(e) {
                showToast('❌ Gagal mengirim permintaan teman.', 'error');
            }
        }

        // Terima permintaan teman
        async function acceptFriendRequest(fromUid, fromNickname) {
            if (!currentUser) return;
            try {
                await Promise.all([
                    db.ref(`users/${currentUser.uid}/friends/${fromUid}`).set(true),
                    db.ref(`users/${fromUid}/friends/${currentUser.uid}`).set(true),
                    db.ref(`users/${currentUser.uid}/friendRequests/received/${fromUid}`).remove(),
                    db.ref(`users/${fromUid}/friendRequests/sent/${currentUser.uid}`).remove()
                ]);
                loadFriendsTab();
            } catch(e) {
                showToast('❌ Gagal menerima permintaan teman.', 'error');
            }
        }

        // Tolak permintaan teman
        async function rejectFriendRequest(fromUid) {
            if (!currentUser) return;
            try {
                await Promise.all([
                    db.ref(`users/${currentUser.uid}/friendRequests/received/${fromUid}`).remove(),
                    db.ref(`users/${fromUid}/friendRequests/sent/${currentUser.uid}`).remove()
                ]);
                loadFriendsTab();
            } catch(e) {
                showToast('❌ Gagal menolak permintaan teman.', 'error');
            }
        }

        // Hapus teman
        async function removeFriend(friendUid) {
            if (!currentUser) return;
            if (!confirm('Hapus teman ini dari daftar pertemanan?')) return;
            try {
                await Promise.all([
                    db.ref(`users/${currentUser.uid}/friends/${friendUid}`).remove(),
                    db.ref(`users/${friendUid}/friends/${currentUser.uid}`).remove()
                ]);
                loadFriendsTab();
            } catch(e) {}
        }

        // Load semua konten tab Teman
        async function loadFriendsTab() {
            await Promise.all([ loadFriendRequests(), loadFriendsList() ]);
        }

        // Load daftar permintaan masuk
        async function loadFriendRequests() {
            if (!currentUser) return;
            const el    = document.getElementById('friend-requests-list');
            const badge = document.getElementById('friend-req-badge');
            el.innerHTML = '<div class="friend-pending">⏳ Memuat...</div>';
            try {
                const snap = await db.ref(`users/${currentUser.uid}/friendRequests/received`).get();
                if (!snap.exists()) {
                    el.innerHTML = '<div class="friend-pending">Tidak ada permintaan teman masuk.</div>';
                    badge.style.display = 'none';
                    return;
                }
                const reqs = [];
                snap.forEach(child => reqs.push({ uid: child.key, ...child.val() }));

                badge.textContent = reqs.length;
                badge.style.display = 'inline-flex';

                el.innerHTML = reqs.map(r => `
                    <div class="friend-card">
                        <div class="friend-avatar">${escHtml((r.nickname||'?').charAt(0).toUpperCase())}</div>
                        <div class="friend-info">
                            <div class="friend-name">${escHtml(r.nickname || 'Unknown')}</div>
                            <div class="friend-id">#${r.uid.slice(-6).toUpperCase()}</div>
                        </div>
                        <div class="friend-actions">
                            <button class="btn-fa btn-fa-visit" onclick="playSound('button');visitPlayerProfile('${r.uid}')">🌿 Kunjungi</button>
                            <button class="btn-fa btn-fa-accept" onclick="playSound('button');acceptFriendRequest('${r.uid}','${(r.nickname||'').replace(/'/g,"\\'")}')">✅ Terima</button>
                            <button class="btn-fa btn-fa-reject" onclick="playSound('button');rejectFriendRequest('${r.uid}')">❌ Tolak</button>
                        </div>
                    </div>`).join('');
            } catch(e) {
                el.innerHTML = '<div class="friend-pending">❌ Gagal memuat permintaan.</div>';
            }
        }

        // Load daftar teman
        async function loadFriendsList() {
            if (!currentUser) return;
            const el       = document.getElementById('friends-list');
            const countEl  = document.getElementById('friends-count');
            el.innerHTML = '<div class="friend-pending">⏳ Memuat...</div>';
            try {
                const snap = await db.ref(`users/${currentUser.uid}/friends`).get();
                if (!snap.exists()) {
                    el.innerHTML = '<div class="friend-pending">Kamu belum punya teman. Gunakan fitur Cari Pemain untuk menjalin pertemanan!</div>';
                    countEl.textContent = '(0)';
                    return;
                }
                const uids = Object.keys(snap.val());
                countEl.textContent = `(${uids.length})`;

                const profiles = await Promise.all(
                    uids.map(uid => db.ref(`users/${uid}`).get().then(s => s.exists() ? { uid, ...s.val() } : { uid, nickname: 'Unknown' }))
                );

                el.innerHTML = profiles.map(f => `
                    <div class="friend-card">
                        <div class="friend-avatar">${escHtml((f.nickname||'?').charAt(0).toUpperCase())}</div>
                        <div class="friend-info">
                            <div class="friend-name">${escHtml(f.nickname || 'Unknown')}</div>
                            <div class="friend-id">#${f.uid.slice(-6).toUpperCase()}</div>
                        </div>
                        <div class="friend-actions">
                            <button class="btn-fa btn-fa-visit" onclick="playSound('button');visitPlayerProfile('${f.uid}')">🌿 Kunjungi</button>
                            <button class="btn-fa btn-fa-remove" onclick="playSound('button');removeFriend('${f.uid}')" title="Hapus teman">🗑</button>
                        </div>
                    </div>`).join('');
            } catch(e) {
                el.innerHTML = '<div class="friend-pending">❌ Gagal memuat daftar teman.</div>';
            }
        }

        // =============================================
        // KUNJUNGI PROFIL PEMAIN LAIN (halaman penuh)
        // =============================================
        let _visitUid = null; // uid pemain yang sedang dikunjungi
        let _visitListeners = { rankData: null, stats: null, history: null };

        async function visitPlayerProfile(uid) {
            _visitUid = uid;
            document.getElementById('visit-profile-screen').classList.add('active');
            document.body.style.overflow = 'hidden';
            attachVisitListeners(uid);
            switchVisitTab('profil');
        }

        function closeVisitProfile() {
            document.getElementById('visit-profile-screen').classList.remove('active');
            restoreBodyOverflow();
            detachVisitListeners();
            _visitUid = null;
        }

        function switchVisitTab(tab) {
            ['profil','statistik','riwayat'].forEach(t => {
                document.getElementById(`btn-vtab-${t}`).classList.toggle('active', t === tab);
                document.getElementById(`vtab-${t}`).classList.toggle('active', t === tab);
            });
            // Data diperbarui real-time oleh attachVisitListeners
            // Hanya loadVisitProfil dipanggil sekali untuk info statis (nickname, join date, tombol teman)
            if (tab === 'profil') loadVisitProfil();
        }

        function attachVisitListeners(uid) {
            detachVisitListeners();
            const medals = { 1:'🥇 Juara 1', 2:'🥈 Juara 2', 3:'🥉 Juara 3', 4:'💀 Juara 4' };

            // ── rankData ──
            _visitListeners.rankData = db.ref(`users/${uid}/rankData`);
            _visitListeners.rankData.on('value', rSnap => {
                const r = rSnap.exists() ? rSnap.val() : { rankName: 'Bronze III', points: 0, peakRank: 'Bronze III' };
                const rn    = r.rankName || 'Bronze III';
                const pts   = r.points   || 0;
                const peak  = r.peakRank || 'Bronze III';
                const peakPts = peak === rn
                    ? Math.max(r.peakRankPoints || 0, pts)
                    : (r.peakRankPoints || 0);
                const isMax = rn === 'Platinum MAX';
                const el = id => document.getElementById(id);
                if (el('vp-rank-img'))    { el('vp-rank-img').src = rankImgSrc(rn); el('vp-rank-img').alt = rn; }
                if (el('vp-rank-name'))   el('vp-rank-name').textContent   = rn;
                if (el('vp-rank-points')) el('vp-rank-points').textContent = isMax ? `${pts} poin` : `${pts} / 100 poin`;
                if (el('vp-peak-img'))    { el('vp-peak-img').src = rankImgSrc(peak); el('vp-peak-img').alt = peak; }
                if (el('vp-peak-name'))   el('vp-peak-name').textContent   = peak;
                if (el('vp-peak-points')) el('vp-peak-points').textContent = `${peakPts} poin`;
                const rs = el('vp-rank-section'); if (rs) rs.style.display = '';
                if (el('vp-avatar')) el('vp-avatar').style.cssText = _getRankFrameStyle(rn);
            });

            // ── stats ──
            _visitListeners.stats = db.ref(`users/${uid}/stats`);
            _visitListeners.stats.on('value', snap => {
                const s = snap.exists() ? snap.val() : { totalMatches:0, rank1:0, rank2:0, rank3:0, rank4:0 };
                const total = s.totalMatches || 0;
                const totalWins = (s.rank1||0) + (s.rank2||0) + (s.rank3||0);
                const pct = n => total > 0 ? ((n/total)*100).toFixed(1)+'%' : '0%';
                const el = id => document.getElementById(id);
                if (el('vp-stat-total'))   el('vp-stat-total').textContent   = total;
                if (el('vp-stat-wins'))    el('vp-stat-wins').textContent    = totalWins;
                if (el('vp-stat-losses'))  el('vp-stat-losses').textContent  = s.rank4 || 0;
                if (el('vp-stat-winrate')) el('vp-stat-winrate').textContent = pct(totalWins);
                if (el('vp-stat-p1'))      el('vp-stat-p1').textContent      = pct(s.rank1||0);
                if (el('vp-stat-p2'))      el('vp-stat-p2').textContent      = pct(s.rank2||0);
                if (el('vp-stat-p3'))      el('vp-stat-p3').textContent      = pct(s.rank3||0);
                if (el('vp-stat-p4'))      el('vp-stat-p4').textContent      = pct(s.rank4||0);
            });

            // ── history ──
            _visitListeners.history = db.ref(`users/${uid}/history`).orderByKey().limitToLast(10);
            _visitListeners.history.on('value', snap => {
                const listEl = document.getElementById('vp-history-list');
                if (!listEl) return;
                if (!snap.exists()) {
                    listEl.innerHTML = '<div class="profile-empty">Belum ada riwayat pertandingan.</div>';
                    return;
                }
                const items = [];
                snap.forEach(child => { items.push(child.val()); });
                items.reverse();
                listEl.innerHTML = items.map((m, i) => {
                    const d = new Date(m.date);
                    const tanggal = d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
                    const pts = m.ptsChange;
                    const ptsHtml = pts == null ? '' :
                        `<span class="phi-pts ${pts > 0 ? 'plus' : pts < 0 ? 'minus' : 'zero'}">${pts > 0 ? '+' : ''}${pts} poin</span>`;
                    const rankRowHtml = (m.rankBefore && m.rankAfter)
                        ? `<div class="phi-rank-row">
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankBefore)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankBefore}</span>
                                <span class="phi-rank-pts">${m.ptsBefore != null ? m.ptsBefore : 0} poin</span>
                            </div>
                            <span class="phi-arrow">→</span>
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankAfter)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankAfter}</span>
                                <span class="phi-rank-pts">${m.ptsAfter != null ? m.ptsAfter : 0} poin</span>
                            </div>
                            <span class="phi-date">${tanggal}</span>
                          </div>`
                        : `<span class="phi-date">${tanggal}</span>`;
                    return `<div class="profile-history-item">
                        <div class="phi-header">
                            <span class="phi-result">${i+1}. ${medals[m.rank] || `Juara ${m.rank}`}</span>
                            ${ptsHtml}
                        </div>
                        ${rankRowHtml}
                    </div>`;
                }).join('');
            });
        }

        function detachVisitListeners() {
            if (_visitListeners.rankData) { _visitListeners.rankData.off(); _visitListeners.rankData = null; }
            if (_visitListeners.stats)    { _visitListeners.stats.off();    _visitListeners.stats    = null; }
            if (_visitListeners.history)  { _visitListeners.history.off();  _visitListeners.history  = null; }
        }

        async function loadVisitProfil() {
            const uid = _visitUid;
            if (!uid) return;
            document.getElementById('vp-avatar').textContent = '⏳';
            document.getElementById('vp-name').textContent = 'Memuat...';
            document.getElementById('vp-uid').textContent = '';
            document.getElementById('vp-joined').textContent = '';
            document.getElementById('vp-friend-action').innerHTML = '';
            try {
                const snap = await db.ref(`users/${uid}`).get();
                if (!snap.exists()) {
                    document.getElementById('vp-name').textContent = '❌ Profil tidak ditemukan';
                    return;
                }
                const u = snap.val();
                const nick    = u.nickname || 'Unknown';
                const shortId = uid.slice(-6).toUpperCase();
                const joined  = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
                    : '-';

                document.getElementById('vp-name').textContent = nick;
                db.ref(`userAvatars/${uid}`).get().then(avSnap => {
                    const avNum = avSnap.exists() ? String(avSnap.val()) : '7';
                    const avEl = document.getElementById('vp-avatar');
                    avEl.innerHTML = `<img src="${av(`gambar/avatar/avatar${avNum}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.textContent='${escHtml(nick.charAt(0).toUpperCase())}'">`;
                });
                document.getElementById('vp-uid').textContent    = '#' + shortId;
                document.getElementById('vp-joined').textContent = 'Bergabung: ' + joined;

                // Load rank data for visited player
                db.ref(`users/${uid}/rankData`).get().then(rSnap => {
                    const r = rSnap.exists() ? rSnap.val() : { rankName: 'Bronze III', points: 0, peakRank: 'Bronze III' };
                    const rn    = r.rankName || 'Bronze III';
                    const pts   = r.points   || 0;
                    const peak      = r.peakRank       || 'Bronze III';
                    // Jika peakRank == rankSaatIni, poin tertinggi minimal sama dengan poin saat ini
                    const peakPts   = peak === rn
                        ? Math.max(r.peakRankPoints || 0, pts)
                        : (r.peakRankPoints || 0);
                    const isMax     = rn === 'Platinum MAX';
                    document.getElementById('vp-rank-img').src    = rankImgSrc(rn);
                    document.getElementById('vp-rank-img').alt    = rn;
                    document.getElementById('vp-rank-name').textContent   = rn;
                    document.getElementById('vp-rank-points').textContent = isMax ? `${pts} poin` : `${pts} / 100 poin`;
                    document.getElementById('vp-peak-img').src    = rankImgSrc(peak);
                    document.getElementById('vp-peak-img').alt    = peak;
                    document.getElementById('vp-peak-name').textContent   = peak;
                    document.getElementById('vp-peak-points').textContent = `${peakPts} poin`;
                    document.getElementById('vp-rank-section').style.display = '';
                    document.getElementById('vp-avatar').style.cssText = _getRankFrameStyle(rn);
                }).catch(() => {});

                // Tombol pertemanan
                const actionDiv = document.getElementById('vp-friend-action');
                actionDiv.innerHTML = '';
                if (currentUser && uid !== currentUser.uid) {
                    const [isFriendSnap, isSentSnap] = await Promise.all([
                        db.ref(`users/${currentUser.uid}/friends/${uid}`).get(),
                        db.ref(`users/${currentUser.uid}/friendRequests/sent/${uid}`).get()
                    ]);
                    const btn = document.createElement('button');
                    btn.className = 'btn-visit-friend';
                    if (isFriendSnap.exists()) {
                        btn.style.cssText = 'background:rgba(244,67,54,0.7);color:#fff;';
                        btn.textContent = '🗑 Hapus Teman';
                        btn.onclick = () => { playSound('button'); removeFriend(uid); closeVisitProfile(); };
                    } else if (isSentSnap.exists()) {
                        btn.style.cssText = 'background:rgba(255,193,7,0.4);color:#fff;cursor:default;';
                        btn.textContent = '⏳ Permintaan Terkirim';
                        btn.disabled = true;
                    } else {
                        btn.style.cssText = 'background:rgba(76,175,80,0.8);color:#fff;';
                        btn.textContent = '➕ Tambah Teman';
                        btn.onclick = () => { playSound('button'); sendFriendRequest(uid, nick, btn); };
                    }
                    actionDiv.appendChild(btn);
                }
            } catch(e) {
                document.getElementById('vp-name').textContent = '❌ Gagal memuat profil';
            }
        }

        async function loadVisitStats() {
            const uid = _visitUid;
            if (!uid) return;
            try {
                const snap = await db.ref(`users/${uid}/stats`).get();
                const s = snap.exists() ? snap.val() : { totalMatches:0, rank1:0, rank2:0, rank3:0, rank4:0 };
                const total     = s.totalMatches || 0;
                const totalWins = (s.rank1||0) + (s.rank2||0) + (s.rank3||0);
                const pct = n => total > 0 ? ((n/total)*100).toFixed(1)+'%' : '0%';
                document.getElementById('vp-stat-total').textContent   = total;
                document.getElementById('vp-stat-wins').textContent    = totalWins;
                document.getElementById('vp-stat-losses').textContent  = s.rank4 || 0;
                document.getElementById('vp-stat-winrate').textContent = pct(totalWins);
                document.getElementById('vp-stat-p1').textContent = pct(s.rank1||0);
                document.getElementById('vp-stat-p2').textContent = pct(s.rank2||0);
                document.getElementById('vp-stat-p3').textContent = pct(s.rank3||0);
                document.getElementById('vp-stat-p4').textContent = pct(s.rank4||0);
            } catch(e) {}
        }

        async function loadVisitHistory() {
            const uid = _visitUid;
            if (!uid) return;
            const listEl = document.getElementById('vp-history-list');
            listEl.innerHTML = '<div class="profile-empty">Memuat riwayat...</div>';
            try {
                const snap = await db.ref(`users/${uid}/history`).orderByKey().limitToLast(10).get();
                if (!snap.exists()) {
                    listEl.innerHTML = '<div class="profile-empty">Belum ada riwayat pertandingan.</div>';
                    return;
                }
                const medals = { 1:'🥇 Juara 1', 2:'🥈 Juara 2', 3:'🥉 Juara 3', 4:'💀 Juara 4' };
                const items = [];
                snap.forEach(child => { items.push(child.val()); });
                items.reverse();
                listEl.innerHTML = items.map((m, i) => {
                    const d = new Date(m.date);
                    const tanggal = d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
                    const pts = m.ptsChange;
                    const ptsHtml = pts == null ? '' :
                        `<span class="phi-pts ${pts > 0 ? 'plus' : pts < 0 ? 'minus' : 'zero'}">${pts > 0 ? '+' : ''}${pts} poin</span>`;
                    const rankRowHtml = (m.rankBefore && m.rankAfter)
                        ? `<div class="phi-rank-row">
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankBefore)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankBefore}</span>
                                <span class="phi-rank-pts">${m.ptsBefore != null ? m.ptsBefore : 0} poin</span>
                            </div>
                            <span class="phi-arrow">→</span>
                            <div class="phi-rank-side">
                                <img src="${rankImgSrc(m.rankAfter)}" class="phi-rank-img" onerror="this.style.display='none'">
                                <span class="phi-rank-name">${m.rankAfter}</span>
                                <span class="phi-rank-pts">${m.ptsAfter != null ? m.ptsAfter : 0} poin</span>
                            </div>
                            <span class="phi-date">${tanggal}</span>
                          </div>`
                        : `<span class="phi-date">${tanggal}</span>`;
                    return `<div class="profile-history-item">
                        <div class="phi-header">
                            <span class="phi-result">${i+1}. ${medals[m.rank] || `Juara ${m.rank}`}</span>
                            ${ptsHtml}
                        </div>
                        ${rankRowHtml}
                    </div>`;
                }).join('');
            } catch(e) {
                listEl.innerHTML = '<div class="profile-empty">Gagal memuat riwayat.</div>';
            }
        }

        // Alias compat - fungsi lama tidak dipakai lagi tapi biarkan jika ada referensi
        function viewPlayerProfile(uid) { visitPlayerProfile(uid); }

        // =============================================
        // RANK INFO MODAL
        // =============================================
        function showRankInfo() {
            document.getElementById('rank-info-overlay').style.display = 'block';
        }
        function hideRankInfo() {
            document.getElementById('rank-info-overlay').style.display = 'none';
        }

        // =============================================
        // DRAW LEVEL INFO POPUP
        // =============================================
        const DL_RATES = {
            1:  { common:22, commonplus:16, uncommonplus:13, uncommon:11, rare:10, rarestar:9,  rareplus:8,  epic:6,  legendary:4,  mythic:1  },
            2:  { commonplus:21, common:16, uncommonplus:15, uncommon:13, rare:11, rarestar:10, rareplus:7,  epic:4,  legendary:2,  mythic:1  },
            3:  { uncommonplus:20, uncommon:14, commonplus:15, common:13, rare:12, rarestar:11, rareplus:8,  epic:4,  legendary:2,  mythic:1  },
            4:  { uncommon:19, uncommonplus:15, commonplus:13, common:11, rare:13, rarestar:12, rareplus:9,  epic:5,  legendary:2,  mythic:1  },
            5:  { rare:18, uncommon:14, rarestar:13, uncommonplus:13, rareplus:11, commonplus:11, common:10, epic:8,  legendary:1,  mythic:1  },
            6:  { rarestar:17, rare:14, uncommon:13, rareplus:12, uncommonplus:11, commonplus:10, epic:9, common:9, legendary:4,  mythic:1  },
            7:  { rareplus:16, rarestar:14, rare:13, uncommon:11, epic:12, uncommonplus:10, commonplus:9, common:8, legendary:5,  mythic:2  },
            8:  { epic:15, rareplus:14, rarestar:13, legendary:11, rare:11, uncommon:10, uncommonplus:9, commonplus:8, common:7, mythic:2  },
            9:  { legendary:14, epic:14, rareplus:13, rarestar:11, rare:10, uncommon:9, uncommonplus:8, commonplus:7, common:6, mythic:8  },
            10: { mythic:20, legendary:17, epic:14, rareplus:11, rarestar:10, rare:9, uncommon:7, uncommonplus:6, commonplus:4, common:2  }
        };
        const DL_LABELS = [
            { key:'mythic',      label:'👑 Mythic' },
            { key:'legendary',   label:'🔥 Legendary' },
            { key:'epic',        label:'👾 Epic' },
            { key:'rareplus',    label:'💎 Rare+' },
            { key:'rarestar',    label:'💙 Rare★' },
            { key:'rare',        label:'💠 Rare' },
            { key:'uncommon',    label:'💚 Uncommon' },
            { key:'uncommonplus',label:'🍀 Uncommon+' },
            { key:'commonplus',  label:'🟢 Common+' },
            { key:'common',      label:'⚪ Common' },
        ];
        const DL_THRESHOLDS = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // index=level, value=min drawCount (naik setiap 1 draw)
        const DL_STARS = { 1:'⭐', 2:'⭐', 3:'⭐', 4:'⭐', 5:'⭐', 6:'⭐', 7:'⭐', 8:'⭐', 9:'⭐', 10:'⭐' };

        function showDrawLevelInfo(playerId) {
            if (!gameState) return;
            const targetId = playerId || myPlayerId;
            if (!targetId) return;
            const player = gameState.players.find(p => p.id === targetId);
            const level  = (player && player.drawLevel) || 1;
            const count  = (player && player.drawCount) || 0;

            // Update judul: tampilkan nama pemain jika bukan diri sendiri
            const titleEl = document.querySelector('#draw-level-overlay .dl-title');
            if (titleEl) {
                titleEl.textContent = playerId
                    ? `🎰 Draw Level — ${getBotDisplayName(player)}`
                    : '🎰 Draw Level';
            }

            // Bintang & teks level
            document.getElementById('dl-star').textContent        = DL_STARS[level];
            document.getElementById('dl-level-text').textContent  = 'Level ' + level;

            // Progress bar
            const isMax = level >= 10;
            if (isMax) {
                document.getElementById('dl-progress-label-left').textContent  = '✨ Level Maksimal!';
                document.getElementById('dl-progress-label-right').textContent = '';
                document.getElementById('dl-progress-fill').style.width        = '100%';
                document.getElementById('dl-progress-fill').style.background   = 'linear-gradient(90deg,#ffd700,#f093fb)';
            } else {
                const start      = DL_THRESHOLDS[level];
                const nextStart  = DL_THRESHOLDS[level + 1];
                const inLevel    = count - start;
                const needed     = nextStart - start;
                const pct        = Math.min(100, Math.round(inLevel / needed * 100));
                document.getElementById('dl-progress-label-left').textContent  = `${inLevel} / ${needed} draw menuju Level ${level + 1}`;
                document.getElementById('dl-progress-label-right').textContent = pct + '%';
                document.getElementById('dl-progress-fill').style.width        = pct + '%';
                document.getElementById('dl-progress-fill').style.background   = 'linear-gradient(90deg,#f093fb,#f5576c)';
            }

            // Rate grid
            const grid = document.getElementById('dl-rate-grid');
            grid.innerHTML = '';
            const rates = DL_RATES[level];
            const stock = (gameState && gameState.rarityStock) || {};
            DL_LABELS.forEach(({ key, label }) => {
                const row = document.createElement('div');
                row.className = 'dl-rate-row';
                const s = stock[key];
                const stockText = s ? `${s.remaining}/${s.total} kartu` : '—';
                row.innerHTML = `<span class="dl-rate-name">${label}</span><span class="dl-rate-pct">${rates[key]}%</span><span class="dl-rate-stock">📦 ${stockText}</span>`;
                grid.appendChild(row);
            });

            document.getElementById('draw-level-overlay').classList.add('active');
        }

        function hideDrawLevelInfo() {
            document.getElementById('draw-level-overlay').classList.remove('active');
        }

        // =============================================
        // LEADERBOARD
        // =============================================
        function showLeaderboard() {
            document.getElementById('leaderboard-screen').style.display = 'block';
            loadLeaderboard();
        }
        function hideLeaderboard() {
            document.getElementById('leaderboard-screen').style.display = 'none';
            // Lepas listener saat leaderboard ditutup
            if (_leaderboardRef) { _leaderboardRef.off(); _leaderboardRef = null; }
        }
        let _lbRenderVersion = 0; // versi render — mencegah race condition async avatar fetch
        function loadLeaderboard() {
            const listEl = document.getElementById('leaderboard-list');
            listEl.innerHTML = '<div class="profile-empty">⏳ Memuat leaderboard...</div>';
            // Lepas listener lama jika ada
            if (_leaderboardRef) { _leaderboardRef.off(); _leaderboardRef = null; }
            // Baca dari node /leaderboard (ditulis server, flat & cepat) secara real-time
            _leaderboardRef = db.ref('leaderboard');
            _leaderboardRef.on('value', async snap => {
                const myVersion = ++_lbRenderVersion; // tandai versi render ini
                if (!snap.exists()) {
                    listEl.innerHTML = '<div class="profile-empty">Belum ada data pemain.</div>';
                    return;
                }
                const entries = [];
                snap.forEach(userSnap => {
                    const uid = userSnap.key;
                    const d   = userSnap.val() || {};
                    const rankName  = d.rankName || 'Bronze III';
                    const points    = d.points   || 0;
                    const rankIndex = RANKS.indexOf(rankName);
                    entries.push({ uid, nick: d.name || 'Unknown', rankName, points, rankIndex });
                });
                entries.sort((a, b) => {
                    if (b.rankIndex !== a.rankIndex) return b.rankIndex - a.rankIndex;
                    return b.points - a.points;
                });
                const top100    = entries.slice(0, 100);
                const myUid     = currentUser ? currentUser.uid : null;
                const posLabels = ['🥇','🥈','🥉'];
                const posClass  = ['gold','silver','bronze'];
                const itemClass = ['lb-top1','lb-top2','lb-top3'];
                // Fetch all avatars in one read
                let avatarMap = {};
                try {
                    const avSnap = await db.ref('userAvatars').get();
                    if (avSnap.exists()) avatarMap = avSnap.val();
                } catch(e) {}
                // Jika ada render lebih baru (snapshot Firebase berikutnya sudah diproses), batalkan
                if (myVersion !== _lbRenderVersion) return;
                listEl.innerHTML = top100.map((e, i) => {
                    const pos     = i + 1;
                    const isSelf  = e.uid === myUid;
                    const posDisp = pos <= 3
                        ? `<span class="lb-pos ${posClass[i]}">${posLabels[i]}</span>`
                        : `<span class="lb-pos">${pos}</span>`;
                    const topCls  = pos <= 3 ? itemClass[i] : '';
                    const selfCls = isSelf ? 'lb-self' : '';
                    const selfTag = isSelf ? '<span class="lb-self-tag">Kamu</span>' : '';
                    const ptsTxt  = e.rankName === 'Platinum MAX' ? `${e.points} poin` : `${e.points} / 100 poin`;
                    const avNum   = avatarMap[e.uid] || '7';
                    const fStyle  = _getRankFrameStyle(e.rankName);
                    return `<div class="lb-item ${topCls} ${selfCls}" onclick="playSound('button');visitPlayerProfile('${e.uid}')">
                        ${posDisp}
                        <div style="width:38px;height:38px;border-radius:7px;overflow:hidden;${fStyle}flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);">
                            <img src="${av(`gambar/avatar/avatar${avNum}.png`)}" class="lb-avatar" onerror="this.src='gambar/avatar/avatar7.png?v='+ASSET_V">
                        </div>
                        <img src="${rankImgSrc(e.rankName)}" class="lb-rank-img" onerror="this.style.display='none'">
                        <div class="lb-info">
                            <div class="lb-name">${escHtml(e.nick)}${selfTag}</div>
                            <div class="lb-rank-label">${e.rankName} &bull; ${ptsTxt}</div>
                        </div>
                    </div>`;
                }).join('');
                if (top100.length === 0) listEl.innerHTML = '<div class="profile-empty">Belum ada data pemain.</div>';
            }, err => {
                listEl.innerHTML = '<div class="profile-empty">Gagal memuat leaderboard.</div>';
                console.error('Leaderboard error:', err);
            });
        }

        // Fungsi lama — tidak digunakan lagi (teman-tab-badge sudah dihapus)
        function updateFriendTabBadge() {}

        // =============================================
        // BADGE NOTIFIKASI PERMINTAAN TEMAN
        // =============================================
        let _friendReqListener = null;
        let _friendReqPrevCount = 0;
        let _friendReqFirstLoad = true;

        function _startFriendRequestBadge() {
            if (!currentUser) return;
            if (_friendReqListener) _friendReqListener.off();
            _friendReqPrevCount = 0;
            _friendReqFirstLoad = true;
            _friendReqListener = db.ref(`users/${currentUser.uid}/friendRequests/received`);
            _friendReqListener.on('value', snap => {
                const badge = document.getElementById('teman-notif-badge');
                if (!badge) return;
                const count = snap.exists() ? Object.keys(snap.val()).length : 0;
                // Update badge
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                    // Ulangi animasi pop setiap kali badge muncul/bertambah
                    badge.style.animation = 'none';
                    requestAnimationFrame(() => { badge.style.animation = 'badgePop 0.3s ease'; });
                } else {
                    badge.style.display = 'none';
                }
                // Toast notifikasi hanya saat ada request baru (bukan load awal saat login)
                if (!_friendReqFirstLoad && count > _friendReqPrevCount) {
                    const entries = Object.entries(snap.val())
                        .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
                    const latestName = entries[0]?.[1]?.nickname || 'Seseorang';
                    showToast(`👥 ${latestName} mengajakmu berteman! Buka menu Teman.`, 'info', 5000);
                }
                _friendReqPrevCount = count;
                _friendReqFirstLoad = false;
            });
        }

        // =============================================
        // PARTY LOBBY
        // =============================================
        let _partyFriendUid   = null;  // Slot 2
        let _partyFriendName  = null;
        let _partyFriend2Uid  = null;  // Slot 3
        let _partyFriend2Name = null;
        let _partyId          = null;
        let _partyFirebaseId  = null;  // ID Firebase party asli (party_xxx) — terpisah dari sharedPartyId (qp_xxx) saat queuing
        let _partyInviteData  = null;
        let _partyStatusRef   = null;  // Listener accept/decline slot 2
        let _partyStatus2Ref  = null;  // Listener accept/decline slot 3
        let _partyInviteRef   = null;
        let _partySignalRef   = null;  // Listener partyStart dari host (sisi penerima)
        let _isPartyGuest         = false; // true saat melihat party lobby sebagai tamu (bukan host)
        let _partyHostUid         = null;  // UID host party (dipakai tamu)
        let _partyHostName        = null;  // Nama host party (dipakai tamu untuk re-render lobi)
        let _myPartySlot          = 2;     // Nomor slot tamu ini di lobi party (2 atau 3)
        let _guestPartyStatusRef  = null;  // Listener partyStatus host (update slot 3 real-time)
        let _partyRosterRef     = null;  // Host: listener roster untuk deteksi tamu keluar sukarela
        let _partyKickRef       = null;  // Guest: listener notifikasi dikick/dibubarkan
        let _partyGuestRosterRef= null;  // Guest: listener roster untuk update slot 3 saat tamu lain keluar
        let _guestSlot3Uid      = null;  // Guest: UID pemain di slot 3
        let _pendingPartySignals = null; // FIX race condition: { uids, partyId, partySize } — dikirim di ws.onopen bukan langsung
        let _openPickerSlot   = null;  // Slot mana yang sedang memilih teman (2 atau 3)
        let _partyPresenceRef = null;  // Real-time listener presence untuk party picker
        let _partyPresenceCb  = null;
        let _customPresenceRef = null; // Real-time listener presence untuk custom picker
        let _customPresenceCb  = null;

        // ── Lobby minimize / restore helpers ──────────────────────────────────
        function minimizePartyLobby() {
            const ov = document.getElementById('party-lobby-overlay');
            ov.style.background = 'transparent';
            ov.style.backdropFilter = 'none';
            ov.style.webkitBackdropFilter = 'none';
            ov.style.pointerEvents = 'none';
            document.querySelector('#party-lobby-overlay .party-lobby-card').style.display = 'none';
            document.getElementById('party-lobby-bubble').style.display = 'flex';
        }
        function restorePartyLobby() {
            const ov = document.getElementById('party-lobby-overlay');
            ov.style.background = '';
            ov.style.backdropFilter = '';
            ov.style.webkitBackdropFilter = '';
            ov.style.pointerEvents = '';
            document.querySelector('#party-lobby-overlay .party-lobby-card').style.display = '';
            document.getElementById('party-lobby-bubble').style.display = 'none';
        }
        function _resetPartyLobbyOverlay() {
            const ov = document.getElementById('party-lobby-overlay');
            ov.style.background = '';
            ov.style.backdropFilter = '';
            ov.style.webkitBackdropFilter = '';
            ov.style.pointerEvents = '';
            const card = document.querySelector('#party-lobby-overlay .party-lobby-card');
            if (card) card.style.display = '';
            document.getElementById('party-lobby-bubble').style.display = 'none';
        }
        function minimizeCustomRoom() {
            const ov = document.getElementById('custom-room-overlay');
            ov.style.background = 'transparent';
            ov.style.backdropFilter = 'none';
            ov.style.webkitBackdropFilter = 'none';
            ov.style.pointerEvents = 'none';
            document.querySelector('#custom-room-overlay .custom-room-card').style.display = 'none';
            document.getElementById('custom-lobby-bubble').style.display = 'flex';
        }
        function restoreCustomRoom() {
            const ov = document.getElementById('custom-room-overlay');
            ov.style.background = '';
            ov.style.backdropFilter = '';
            ov.style.webkitBackdropFilter = '';
            ov.style.pointerEvents = '';
            document.querySelector('#custom-room-overlay .custom-room-card').style.display = '';
            document.getElementById('custom-lobby-bubble').style.display = 'none';
        }
        function _resetCustomRoomOverlay() {
            const ov = document.getElementById('custom-room-overlay');
            ov.style.background = '';
            ov.style.backdropFilter = '';
            ov.style.webkitBackdropFilter = '';
            ov.style.pointerEvents = '';
            const card = document.querySelector('#custom-room-overlay .custom-room-card');
            if (card) card.style.display = '';
            document.getElementById('custom-lobby-bubble').style.display = 'none';
        }
        // ─────────────────────────────────────────────────────────────────────

        function showPartyLobby() {
            // Blokir jika custom room lobby sedang aktif (normal atau minimized)
            if (_customRoomId) {
                showToast('⚠️ Kamu sedang di lobi kostum. Keluar dulu sebelum buka ranked.', 'warning');
                restoreCustomRoom();
                return;
            }
            _resetPartyLobbyOverlay();
            // Reset state
            _partyFriendUid = null; _partyFriendName = null;
            _partyFriend2Uid = null; _partyFriend2Name = null;
            _partyId = null; _openPickerSlot = null;
            _stopPartyPresenceListener();
            document.getElementById('party-friend-picker').style.display = 'none';
            _resetSlot2();
            _resetSlot3();
            // Isi slot 1 dengan nama player sendiri
            const name = currentNickname || lsGet(LS.NICKNAME) || 'Kamu';
            document.getElementById('pslot-1-name').textContent = name;
            document.getElementById('pslot-1-icon').innerHTML = _getAvatarWithFrameHtml(54);
            // Tampilkan overlay
            document.getElementById('party-lobby-overlay').style.display = 'flex';
            _setPresenceStatus('inLobby');
        }

        function closePartyLobby(keepPartyId = false, enteringQueue = false) {
            // Jika dalam mode tamu, gunakan alur batal khusus tamu
            if (_isPartyGuest) {
                if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
                // FIX: Jangan hapus partyStatus saat masuk antrian (enteringQueue=true)
                // karena data ini dibutuhkan untuk re-render lobi jika tamu cancel dari queue.
                // Hanya hapus saat tamu benar-benar keluar dari party (bukan sedang queuing).
                if (!enteringQueue && _partyId && currentUser) {
                    db.ref(`partyRoster/${_partyId}/${currentUser.uid}`).remove().catch(() => {});
                    if (_partyHostUid) {
                        db.ref(`users/${_partyHostUid}/partyStatus/${_partyId}/${currentUser.uid}`).remove().catch(() => {});
                    }
                }
                _closeGuestPartyLobby();
                _partyId = null;
                _partyQueueSize = null;
                _setPresenceStatus('online');
                return;
            }
            _resetPartyLobbyOverlay();
            document.getElementById('party-lobby-overlay').style.display = 'none';
            _stopPartyPresenceListener();
            document.getElementById('party-friend-picker').style.display = 'none';
            _setPresenceStatus('online');
            // Batalkan invite yang sudah dikirim (jika ada)
            if (_partyFriendUid && currentUser) {
                db.ref(`users/${_partyFriendUid}/partyInvite`).remove().catch(() => {});
            }
            if (_partyFriend2Uid && currentUser) {
                db.ref(`users/${_partyFriend2Uid}/partyInvite`).remove().catch(() => {});
            }
            if (_partyStatusRef) { _partyStatusRef.off(); _partyStatusRef = null; }
            if (_partyStatus2Ref) { _partyStatus2Ref.off(); _partyStatus2Ref = null; }
            // Stop roster listener
            if (_partyRosterRef) { _partyRosterRef.off(); _partyRosterRef = null; }
            // Jika host benar-benar menutup lobby (bukan mulai matchmaking), beritahu semua tamu
            if (!keepPartyId && _partyId && currentUser) {
                if (_partyFriendUid)  db.ref(`users/${_partyFriendUid}/partyKick`).set({ disbanded: true }).catch(() => {});
                if (_partyFriend2Uid) db.ref(`users/${_partyFriend2Uid}/partyKick`).set({ disbanded: true }).catch(() => {});
                db.ref(`partyRoster/${_partyId}`).remove().catch(() => {});
                // Hapus seluruh partyStatus agar tidak terbaca di sesi berikutnya
                db.ref(`users/${currentUser.uid}/partyStatus`).remove().catch(() => {});
            }
            _openPickerSlot = null;
            // keepPartyId=true digunakan oleh startMatchmakingFromParty:
            // - partyId tidak direset (agar JOIN_MATCHMAKING pakai ID yang benar)
            // - _partyFriendUid/_partyFriend2Uid tidak direset (agar saat kembali ke lobi setelah
            //   cancel, host tekan Mulai lagi masih bisa kirim partySignal ke tamu yang benar)
            if (!keepPartyId) {
                _partyFriendUid = null; _partyFriendName = null;
                _partyFriend2Uid = null; _partyFriend2Name = null;
                _partyId = null;
                _partyFirebaseId = null;
            }
        }

        function _stopPartyPresenceListener() {
            if (_partyPresenceRef && _partyPresenceCb) {
                _partyPresenceRef.off('value', _partyPresenceCb);
                _partyPresenceRef = null; _partyPresenceCb = null;
            }
        }

        function togglePartyFriendPicker(slotNum) {
            const slotFilled = slotNum === 2 ? _partyFriendUid : _partyFriend2Uid;
            if (slotFilled) return; // slot sudah terisi
            const picker = document.getElementById('party-friend-picker');
            if (picker.style.display === 'none' || _openPickerSlot !== slotNum) {
                _openPickerSlot = slotNum;
                picker.style.display = 'block';
                _loadPartyFriendList();
            } else {
                _stopPartyPresenceListener();
                picker.style.display = 'none';
                _openPickerSlot = null;
            }
        }

        async function _loadPartyFriendList() {
            const el = document.getElementById('party-friend-list');
            el.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85em;padding:6px 0;">⏳ Memuat...</div>';
            if (!currentUser) {
                el.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85em;">Login diperlukan.</div>';
                return;
            }
            // Cleanup listener lama jika ada
            if (_partyPresenceRef && _partyPresenceCb) {
                _partyPresenceRef.off('value', _partyPresenceCb);
                _partyPresenceRef = null; _partyPresenceCb = null;
            }
            try {
                const snap = await db.ref(`users/${currentUser.uid}/friends`).get();
                if (!snap.exists()) {
                    el.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85em;">Belum ada teman. Tambah lewat menu Teman!</div>';
                    return;
                }
                const friends = snap.val();
                const uids = Object.keys(friends);
                // Fetch semua nickname sekali
                const profiles = await Promise.all(uids.map(uid =>
                    db.ref(`users/${uid}/nickname`).get().then(s => ({ uid, nickname: s.val() || 'Unknown' }))
                ));

                // Fungsi render menggunakan data presence terbaru
                function renderWithPresence(presence) {
                    const alreadyInvited = [_partyFriendUid, _partyFriend2Uid].filter(Boolean);
                    const sorted = [...profiles].sort((a, b) => {
                        const aOk = presence[a.uid]?.online && !presence[a.uid]?.status && !alreadyInvited.includes(a.uid) ? 0 : 1;
                        const bOk = presence[b.uid]?.online && !presence[b.uid]?.status && !alreadyInvited.includes(b.uid) ? 0 : 1;
                        return aOk - bOk;
                    });
                    if (!sorted.length) {
                        el.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85em;">Belum ada teman.</div>';
                        return;
                    }
                    el.innerHTML = sorted.map(f => {
                        const pres = presence[f.uid];
                        const isInvited = alreadyInvited.includes(f.uid);
                        let canInvite = false, statusLabel = '', statusColor = '';
                        if (isInvited) {
                            statusLabel = '✅ Sudah diundang'; statusColor = 'rgba(76,175,80,0.9)';
                        } else if (!pres?.online) {
                            statusLabel = '⚫ Offline'; statusColor = 'rgba(255,255,255,0.35)';
                        } else if (pres.status === 'inGame') {
                            statusLabel = '🎮 Sedang bermain'; statusColor = 'rgba(244,67,54,0.9)';
                        } else if (pres.status === 'inQueue') {
                            statusLabel = '🔍 Mencari lawan'; statusColor = 'rgba(255,193,7,0.9)';
                        } else if (pres.status === 'inLobby') {
                            statusLabel = '🚪 Sedang di lobby'; statusColor = 'rgba(255,193,7,0.9)';
                        } else {
                            canInvite = true; statusLabel = '🟢 Online'; statusColor = 'rgba(76,175,80,0.9)';
                        }
                        return `
                        <button class="party-friend-item" style="${canInvite ? '' : 'opacity:0.52;cursor:default;'}"
                            ${canInvite ? `onclick="playSound('button');_selectPartyFriend('${escHtml(f.uid)}','${escHtml(f.nickname)}',${_openPickerSlot || 2})"` : ''}>
                            <div class="party-friend-avatar">${escHtml(f.nickname.charAt(0).toUpperCase())}</div>
                            <div style="flex:1;min-width:0;text-align:left;">
                                <div class="party-friend-name">${escHtml(f.nickname)}</div>
                                <div style="font-size:0.72em;color:${statusColor};margin-top:2px;">${statusLabel}</div>
                            </div>
                        </button>`;
                    }).join('');
                }

                // Set up real-time listener pada node presence
                _partyPresenceRef = db.ref('presence');
                _partyPresenceCb = (presSnap) => {
                    const presence = presSnap.exists() ? presSnap.val() : {};
                    renderWithPresence(presence);
                };
                _partyPresenceRef.on('value', _partyPresenceCb);
            } catch(e) {
                el.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85em;">❌ Gagal memuat.</div>';
            }
        }

        async function _selectPartyFriend(uid, name, slotNum) {
            // slotNum: 2 = teman 1, 3 = teman 2
            if (!_partyId) {
                // Buat partyId baru pertama kali teman dipilih
                _partyId = `party_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                _partyFirebaseId = _partyId; // Simpan ID Firebase asli
                if (currentUser) {
                    // Bersihkan partyStatus lama agar listener tamu tidak baca data basi
                    db.ref(`users/${currentUser.uid}/partyStatus`).remove().catch(() => {});
                    // Tulis host ke partyRoster — onDisconnect hapus seluruh roster jika host offline/refresh
                    // Ini adalah sinyal utama bagi tamu bahwa party bubar
                    const hostRosterRef = db.ref(`partyRoster/${_partyId}`);
                    hostRosterRef.set({ host: currentUser.uid }).catch(() => {});
                    hostRosterRef.onDisconnect().remove();
                }
            }
            // Sembunyikan picker
            _stopPartyPresenceListener();
            document.getElementById('party-friend-picker').style.display = 'none';
            _openPickerSlot = null;
            // Update slot → status menunggu
            const slotEl = document.getElementById(`pslot-${slotNum}`);
            slotEl.className = 'party-slot waiting';
            slotEl.onclick = null;
            document.getElementById(`pslot-${slotNum}-icon`).textContent  = '⌛';
            document.getElementById(`pslot-${slotNum}-name`).textContent  = escHtml(name);
            document.getElementById(`pslot-${slotNum}-sub`).textContent   = 'Menunggu jawaban...';
            document.getElementById(`pslot-${slotNum}-clear`).style.display = 'flex';
            // Simpan UID/nama ke variabel yang sesuai
            if (slotNum === 2) { _partyFriendUid = uid; _partyFriendName = name; }
            else               { _partyFriend2Uid = uid; _partyFriend2Name = name; }
            // Kirim undangan via Firebase
            if (currentUser) {
                try {
                    const partyInviteRef = db.ref(`users/${uid}/partyInvite`);
                    await partyInviteRef.set({
                        fromUid: currentUser.uid,
                        fromName: currentNickname || 'Player',
                        partyId: _partyId,
                        slotNum: slotNum,
                        timestamp: Date.now()
                    });
                    partyInviteRef.onDisconnect().remove();
                } catch(e) {
                    showToast('❌ Gagal mengirim undangan.', 'error');
                    clearPartyFriend(slotNum); return;
                }
            }
            // Dengarkan balasan — path terpisah per UID teman
            const statusPath = `users/${currentUser.uid}/partyStatus/${_partyId}/${uid}`;
            const statusRef = db.ref(statusPath);
            if (slotNum === 2) { if (_partyStatusRef) _partyStatusRef.off(); _partyStatusRef = statusRef; }
            else               { if (_partyStatus2Ref) _partyStatus2Ref.off(); _partyStatus2Ref = statusRef; }
            statusRef.on('value', snap => {
                if (!snap.exists()) return;
                const s = snap.val();
                if (s.accepted) {
                    const slotEl2 = document.getElementById(`pslot-${slotNum}`);
                    slotEl2.className = 'party-slot joined';
                    slotEl2.onclick = null;
                    const acceptedName = s.acceptorName || name;
                    document.getElementById(`pslot-${slotNum}-name`).textContent = escHtml(acceptedName);
                    document.getElementById(`pslot-${slotNum}-sub`).textContent  = 'Siap bermain!';
                    // Tampilkan foto profil + bingkai rank teman yang menerima
                    Promise.all([
                        db.ref(`userAvatars/${uid}`).get(),
                        db.ref(`users/${uid}/rankData`).get()
                    ]).then(([avSnap, rkSnap]) => {
                        const avNum = avSnap.exists() ? String(avSnap.val()) : '7';
                        const rkName = rkSnap.exists() ? (rkSnap.val().rankName || 'Bronze III') : 'Bronze III';
                        const fStyle = _getRankFrameStyle(rkName);
                        const init = escHtml(acceptedName.charAt(0).toUpperCase());
                        const iconEl = document.getElementById(`pslot-${slotNum}-icon`);
                        if (iconEl) iconEl.innerHTML = `<div style="width:54px;height:54px;border-radius:10px;overflow:hidden;${fStyle}display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:1.4em;font-weight:bold;color:white;"><img src="${av(`gambar/avatar/avatar${avNum}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.textContent='${init}'"></div>`;
                    }).catch(() => {
                        const iconEl = document.getElementById(`pslot-${slotNum}-icon`);
                        if (iconEl) iconEl.textContent = '✅';
                    });
                    playSound('invite');
                    showToast(`✅ ${acceptedName} menerima undangan!`, 'success');
                    // Jangan hapus statusPath — biarkan tetap ada agar tamu yang accept belakangan
                    // bisa membaca siapa saja yang sudah join lewat listener _guestPartyStatusRef
                    // statusPath akan dihapus saat party bubar/closePartyLobby
                    statusRef.off();
                    if (slotNum === 2) _partyStatusRef = null; else _partyStatus2Ref = null;
                    // Tulis roster agar tamu lain dapat pantau kehadiran slot ini
                    if (_partyId) db.ref(`partyRoster/${_partyId}/${uid}`).set(true).catch(() => {});
                    // Pasang onDisconnect kick ke tamu ini jika host disconnect/refresh
                    if (currentUser && _partyId) {
                        db.ref(`users/${uid}/partyKick`).onDisconnect().set({ disbanded: true });
                    }
                    // Pasang listener roster (sekali saja) untuk deteksi tamu keluar sukarela
                    if (!_partyRosterRef && _partyId) {
                        _partyRosterRef = db.ref(`partyRoster/${_partyId}`);
                        _partyRosterRef.on('child_removed', rSnap => {
                            const leftUid = rSnap.key;
                            if (leftUid === _partyFriendUid) {
                                _partyFriendUid = null; _partyFriendName = null;
                                _resetPartySlot(2);
                                showToast('ℹ️ Tamu meninggalkan party.', 'info');
                            } else if (leftUid === _partyFriend2Uid) {
                                _partyFriend2Uid = null; _partyFriend2Name = null;
                                _resetPartySlot(3);
                                showToast('ℹ️ Tamu meninggalkan party.', 'info');
                            }
                        });
                    }
                } else if (s.accepted === false) {
                    showToast(`❌ ${name} menolak undangan.`, 'error');
                    db.ref(statusPath).remove().catch(() => {});
                    statusRef.off();
                    if (slotNum === 2) { _partyFriendUid = null; _partyFriendName = null; _partyStatusRef = null; }
                    else               { _partyFriend2Uid = null; _partyFriend2Name = null; _partyStatus2Ref = null; }
                    _resetPartySlot(slotNum);
                }
            });
        }

        function clearPartyFriend(slotNum) {
            const uid = slotNum === 2 ? _partyFriendUid : _partyFriend2Uid;
            if (uid && currentUser) {
                db.ref(`users/${uid}/partyInvite`).remove().catch(() => {});
                // Notifikasi kick ke tamu + hapus dari roster bersama
                if (_partyId) {
                    db.ref(`users/${uid}/partyKick`).set({ kicked: true, partyId: _partyId }).catch(() => {});
                    db.ref(`partyRoster/${_partyId}/${uid}`).remove().catch(() => {});
                    // Hapus partyStatus tamu ini agar saat diundang ulang listener tidak baca data accept lama
                    db.ref(`users/${currentUser.uid}/partyStatus/${_partyId}/${uid}`).remove().catch(() => {});
                }
            }
            if (slotNum === 2) {
                if (_partyStatusRef) { _partyStatusRef.off(); _partyStatusRef = null; }
                _partyFriendUid = null; _partyFriendName = null;
            } else {
                if (_partyStatus2Ref) { _partyStatus2Ref.off(); _partyStatus2Ref = null; }
                _partyFriend2Uid = null; _partyFriend2Name = null;
            }
            // Hapus partyId hanya jika kedua slot kosong
            if (!_partyFriendUid && !_partyFriend2Uid) _partyId = null;
            _resetPartySlot(slotNum);
            _stopPartyPresenceListener();
            document.getElementById('party-friend-picker').style.display = 'none';
        }

        function _resetPartySlot(slotNum) {
            const el = document.getElementById(`pslot-${slotNum}`);
            if (!el) return;
            el.className = 'party-slot empty';
            el.onclick = () => { playSound('button'); togglePartyFriendPicker(slotNum); };
            document.getElementById(`pslot-${slotNum}-icon`).textContent  = '➕';
            document.getElementById(`pslot-${slotNum}-name`).textContent  = 'Ajak Teman';
            document.getElementById(`pslot-${slotNum}-sub`).textContent   = '(opsional)';
            document.getElementById(`pslot-${slotNum}-clear`).style.display = 'none';
        }

        function _resetSlot2() { _resetPartySlot(2); }
        function _resetSlot3() { _resetPartySlot(3); }

        function startMatchmakingFromParty() {
            // Hitung jumlah teman yang sudah menerima (slot joined)
            const slot2Joined = document.getElementById('pslot-2')?.classList.contains('joined');
            const slot3Joined = document.getElementById('pslot-3')?.classList.contains('joined');
            const friendCount = (slot2Joined ? 1 : 0) + (slot3Joined ? 1 : 0);
            const partySize = 1 + friendCount;
            _partyQueueSize = partySize > 1 ? partySize : null;

            // Beritahu teman yang sudah join untuk segera masuk antrian via Firebase partySignal
            const acceptedUids = [
                slot2Joined ? _partyFriendUid : null,
                slot3Joined ? _partyFriend2Uid : null
            ].filter(Boolean);
            // FIX race condition: simpan sinyal dulu, baru kirim di ws.onopen setelah host connect.
            // Ini mencegah tamu menerima partySignal sebelum sempat pasang ulang listener
            // (yang terjadi jika host langsung mulai ulang setelah cancel).
            _pendingPartySignals = acceptedUids.length > 0
                ? { uids: acceptedUids, partyId: _partyId, partySize }
                : null;

            // Pasang listener partyCancelSearch untuk HOST — agar host ikut berhenti
            // jika salah satu tamu membatalkan pencarian lawan
            if (currentUser && friendCount > 0) {
                const hostCancelRef = db.ref(`users/${currentUser.uid}/partyCancelSearch`);
                hostCancelRef.off();
                hostCancelRef.on('value', snap => {
                    if (!snap.exists()) return;
                    const val = snap.val();
                    hostCancelRef.remove().catch(() => {});
                    hostCancelRef.off();
                    const floatBar = document.getElementById('matchmaking-float-bar');
                    if (!floatBar || floatBar.style.display === 'none') return;
                    // Hentikan pencarian
                    hideMatchmakingFloatBar();
                    stopMatchmakingCountdown();
                    if (ws) {
                        try { ws.send(JSON.stringify({ type: 'LEAVE_QUEUE' })); } catch(e) {}
                        ws.onclose = null; ws.onerror = null;
                        ws.close();
                        ws = null;
                    }
                    soundEffects.bgMusic2.pause();
                    soundEffects.bgMusic2.currentTime = 0;
                    soundEffects.bgMusic.play().catch(() => {});
                    _partyQueueSize = null;
                    if (_partyFirebaseId) _partyId = _partyFirebaseId;
                    _setPresenceStatus('inLobby');
                    // Kembalikan host ke lobi party
                    document.getElementById('party-lobby-overlay').style.display = 'flex';
                    const cancellerName = val?.cancelledBy || 'Salah satu pemain';
                    showToast(`ℹ️ ${cancellerName} membatalkan pencarian lawan.`, 'info');
                });
            }

            // keepPartyId hanya jika ada teman yang sudah join
            // Jika tidak ada → reset partyId agar host masuk antrian solo (bukan party queue)
            closePartyLobby(friendCount > 0);
            startMatchmaking();
        }

        // ---- Sisi penerima undangan ----
        function _startPartyInviteListener() {
            if (!currentUser) return;
            if (_partyInviteRef) _partyInviteRef.off();
            _partyInviteRef = db.ref(`users/${currentUser.uid}/partyInvite`);
            _partyInviteRef.on('value', snap => {
                if (!snap.exists()) {
                    document.getElementById('party-invite-popup').style.display = 'none';
                    _partyInviteData = null; // Hapus data lama agar klik "Terima" yang terlambat tidak diproses
                    return;
                }
                const inv = snap.val();
                if (!inv || !inv.fromUid || !inv.partyId) return;
                // Abaikan undangan yang tidak punya timestamp (data lama dari sesi sebelumnya)
                if (!inv.timestamp) {
                    db.ref(`users/${currentUser.uid}/partyInvite`).remove();
                    return;
                }
                // Abaikan undangan lebih dari 2 menit
                if (Date.now() - inv.timestamp > 120000) {
                    db.ref(`users/${currentUser.uid}/partyInvite`).remove();
                    return;
                }
                _partyInviteData = inv;
                // Hapus partyKick lama agar tidak trigger "party dibubarkan" setelah terima undangan baru
                db.ref(`users/${currentUser.uid}/partyKick`).remove().catch(() => {});
                document.getElementById('party-invite-msg').textContent =
                    `${inv.fromName || 'Seorang teman'} mengajakmu main bareng!`;
                document.getElementById('party-invite-popup').style.display = 'flex';
            });
        }

        async function acceptPartyInvite() {
            if (!_partyInviteData || !currentUser) return;

            // Tolak jika sedang aktif di game atau custom room
            if (currentRoomId && lsGet(LS.GAME_ACTIVE) === 'true') {
                showToast('⚠️ Kamu sedang dalam pertandingan. Selesaikan dulu.', 'warning');
                return;
            }
            if (_customRoomId) {
                showToast('⚠️ Kamu sedang di custom room. Keluar dulu.', 'warning');
                return;
            }

            // Bersihkan semua listener party lama sebelum join party baru
            // agar notifikasi "party dibubarkan" dari sesi sebelumnya tidak muncul
            if (_partyKickRef)        { _partyKickRef.off();        _partyKickRef = null; }
            if (_partySignalRef)      { _partySignalRef.off();      _partySignalRef = null; }
            if (_partyGuestRosterRef) { _partyGuestRosterRef.off(); _partyGuestRosterRef = null; }
            if (_guestPartyStatusRef) { _guestPartyStatusRef.off(); _guestPartyStatusRef = null; }
            // Hapus partyKick lama dari Firebase agar tidak terbaca lagi
            db.ref(`users/${currentUser.uid}/partyKick`).remove().catch(() => {});

            const inv = _partyInviteData;
            _partyInviteData = null;
            document.getElementById('party-invite-popup').style.display = 'none';

            // Validasi: pastikan undangan masih ada di Firebase
            // (bisa sudah dihapus jika host sudah mulai matchmaking atau batal)
            const stillValid = await db.ref(`users/${currentUser.uid}/partyInvite`)
                .get().then(s => s.exists()).catch(() => false);
            if (!stillValid) {
                showToast('⚠️ Undangan sudah tidak berlaku (host sudah mulai atau batal).', 'warning');
                return;
            }

            // Hapus undangan
            await db.ref(`users/${currentUser.uid}/partyInvite`).remove().catch(() => {});
            // Beritahu pengundang (tulis ke path dengan UID teman agar bisa dibedakan slot 2/3)
            await db.ref(`users/${inv.fromUid}/partyStatus/${inv.partyId}/${currentUser.uid}`).set({
                accepted: true,
                acceptorUid: currentUser.uid,
                acceptorName: currentNickname || 'Player'
            }).catch(() => {});
            // Simpan partyId, host info, lalu tampilkan party lobby dalam mode tamu
            _partyId = inv.partyId;
            _partyFirebaseId = inv.partyId; // Simpan ID Firebase asli untuk broadcast cancel
            _partyHostUid = inv.fromUid;
            _isPartyGuest = true;
            _setPresenceStatus('inLobby');
            showToast('✅ Undangan diterima! Menunggu host memulai...', 'success');
            // Pasang onDisconnect: jika tamu offline/refresh → otomatis dihapus dari roster & status
            const guestRosterRef = db.ref(`partyRoster/${inv.partyId}/${currentUser.uid}`);
            guestRosterRef.set(true).catch(() => {});
            guestRosterRef.onDisconnect().remove();
            const guestStatusRef = db.ref(`users/${inv.fromUid}/partyStatus/${inv.partyId}/${currentUser.uid}`);
            guestStatusRef.onDisconnect().remove();
            _showGuestPartyLobby(inv.fromUid, inv.fromName, inv.slotNum || 2);
            // Pasang listener sinyal partyStart dari host
            _startPartySignalListener(inv.partyId);
        }

        function _startPartySignalListener(partyId) {
            if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
            if (!currentUser) return;
            _partySignalRef = db.ref(`users/${currentUser.uid}/partySignal`);
            _partySignalRef.on('value', snap => {
                if (!snap.exists()) return;
                const sig = snap.val();
                if (!sig || sig.partyId !== partyId) return;
                // Host sudah mulai — hapus sinyal lalu masuk antrian
                db.ref(`users/${currentUser.uid}/partySignal`).remove().catch(() => {});
                if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
                // FIX: Jangan panggil _closeGuestPartyLobby() di sini karena akan mereset
                // _isPartyGuest, _partyHostUid, _partyHostName, _myPartySlot — semua state
                // yang dibutuhkan untuk re-render lobi saat tamu cancel dari queue.
                // Cukup sembunyikan overlay saja.
                if (_isPartyGuest) {
                    document.getElementById('party-lobby-overlay').style.display = 'none';
                    // Matikan listeners yang tidak diperlukan selama queue
                    if (_guestPartyStatusRef) { _guestPartyStatusRef.off(); _guestPartyStatusRef = null; }
                    if (_partyKickRef) { _partyKickRef.off(); _partyKickRef = null; }
                    if (_partyGuestRosterRef) { _partyGuestRosterRef.off(); _partyGuestRosterRef = null; }
                }
                _partyFirebaseId = sig.partyId; // Pertahankan Firebase ID asli sebelum diganti sharedPartyId
                _partyId = sig.partyId;
                _partyQueueSize = sig.partySize || 2;
                startMatchmaking();
            });
        }

        function _showGuestPartyLobby(hostUid, hostName, mySlotNum) {
            mySlotNum = mySlotNum || 2;
            _myPartySlot  = mySlotNum;   // Simpan agar bisa re-render saat kembali dari queue
            _partyHostName = hostName;   // Simpan nama host untuk re-render
            const otherSlotNum = mySlotNum === 2 ? 3 : 2;
            // Slot 1: Tampilkan host dengan avatar + rank frame
            document.getElementById('pslot-1-name').textContent = escHtml(hostName);
            document.getElementById('pslot-1-icon').textContent = '⌛';
            Promise.all([
                db.ref(`userAvatars/${hostUid}`).get(),
                db.ref(`users/${hostUid}/rankData`).get()
            ]).then(([avSnap, rkSnap]) => {
                const avNum  = avSnap.exists() ? String(avSnap.val()) : '7';
                const rkName = rkSnap.exists() ? (rkSnap.val().rankName || 'Bronze III') : 'Bronze III';
                const fStyle = _getRankFrameStyle(rkName);
                const init   = escHtml(hostName.charAt(0).toUpperCase());
                const el = document.getElementById('pslot-1-icon');
                if (el) el.innerHTML = `<div style="width:54px;height:54px;border-radius:10px;overflow:hidden;${fStyle}display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:1.4em;font-weight:bold;color:white;"><img src="${av(`gambar/avatar/avatar${avNum}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.textContent='${init}'"></div>`;
            }).catch(() => {});
            // Slot milik saya: tampilkan diri sendiri
            const mySlotEl = document.getElementById(`pslot-${mySlotNum}`);
            mySlotEl.className = 'party-slot joined';
            mySlotEl.onclick = null;
            document.getElementById(`pslot-${mySlotNum}-icon`).innerHTML = _getAvatarWithFrameHtml(54);
            document.getElementById(`pslot-${mySlotNum}-name`).textContent = escHtml(currentNickname || 'Kamu');
            document.getElementById(`pslot-${mySlotNum}-sub`).textContent  = 'Siap bermain!';
            document.getElementById(`pslot-${mySlotNum}-clear`).style.display = 'none';
            // Slot tamu lain: non-interaktif (menunggu)
            const otherSlotEl = document.getElementById(`pslot-${otherSlotNum}`);
            otherSlotEl.className = 'party-slot waiting';
            otherSlotEl.onclick = null;
            document.getElementById(`pslot-${otherSlotNum}-icon`).textContent = '⌛';
            document.getElementById(`pslot-${otherSlotNum}-name`).textContent = 'Menunggu...';
            document.getElementById(`pslot-${otherSlotNum}-sub`).textContent  = '';
            document.getElementById(`pslot-${otherSlotNum}-clear`).style.display = 'none';
            // Sembunyikan tombol Mulai (tamu tidak bisa memulai)
            const lobbyCard = document.querySelector('.party-lobby-card');
            if (lobbyCard) lobbyCard.querySelector('.party-btn-start').style.display = 'none';
            // Tampilkan overlay
            _stopPartyPresenceListener();
            document.getElementById('party-friend-picker').style.display = 'none';
            document.getElementById('party-lobby-overlay').style.display = 'flex';
            // Listener real-time: update slot tamu lain saat mereka menerima undangan host
            if (_guestPartyStatusRef) { _guestPartyStatusRef.off(); _guestPartyStatusRef = null; }
            if (_partyId && currentUser) {
                _guestPartyStatusRef = db.ref(`users/${hostUid}/partyStatus/${_partyId}`);
                _guestPartyStatusRef.on('value', snap => {
                    if (!snap.exists()) return;
                    snap.forEach(child => {
                        const uid = child.key;
                        const val = child.val();
                        if (!val || !val.accepted || uid === currentUser.uid) return;
                        // Tamu lain menerima → update slot yang satunya lagi
                        _guestSlot3Uid = uid;
                        const theirName = val.acceptorName || 'Tamu';
                        const sOther = document.getElementById(`pslot-${otherSlotNum}`);
                        if (!sOther) return;
                        sOther.className = 'party-slot joined';
                        sOther.onclick = null;
                        document.getElementById(`pslot-${otherSlotNum}-name`).textContent = escHtml(theirName);
                        document.getElementById(`pslot-${otherSlotNum}-sub`).textContent  = 'Siap bermain!';
                        document.getElementById(`pslot-${otherSlotNum}-clear`).style.display = 'none';
                        document.getElementById(`pslot-${otherSlotNum}-icon`).textContent = '⌛';
                        Promise.all([
                            db.ref(`userAvatars/${uid}`).get(),
                            db.ref(`users/${uid}/rankData`).get()
                        ]).then(([avSnap, rkSnap]) => {
                            const avNum  = avSnap.exists() ? String(avSnap.val()) : '7';
                            const rkName = rkSnap.exists() ? (rkSnap.val().rankName || 'Bronze III') : 'Bronze III';
                            const fStyle = _getRankFrameStyle(rkName);
                            const init   = escHtml(theirName.charAt(0).toUpperCase());
                            const el = document.getElementById(`pslot-${otherSlotNum}-icon`);
                            if (el) el.innerHTML = `<div style="width:54px;height:54px;border-radius:10px;overflow:hidden;${fStyle}display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:1.4em;font-weight:bold;color:white;"><img src="${av(`gambar/avatar/avatar${avNum}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.textContent='${init}'"></div>`;
                        }).catch(() => {});
                    });
                });
            }
            // Listener kick/dibubarkan oleh host
            if (_partyKickRef) { _partyKickRef.off(); _partyKickRef = null; }
            if (currentUser) {
                _partyKickRef = db.ref(`users/${currentUser.uid}/partyKick`);
                _partyKickRef.on('value', snap => {
                    if (!snap.exists()) return;
                    const val = snap.val();
                    db.ref(`users/${currentUser.uid}/partyKick`).remove().catch(() => {});
                    if (_partyKickRef) { _partyKickRef.off(); _partyKickRef = null; }
                    if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
                    _closeGuestPartyLobby();
                    _partyId = null; _partyQueueSize = null;
                    _setPresenceStatus('online');
                    if (val && val.disbanded) {
                        const floatBar = document.getElementById('matchmaking-float-bar');
                        const isInQueue = floatBar && floatBar.style.display !== 'none';
                        const cancellerName = val.cancelledBy || 'Salah satu pemain';
                        showToast(isInQueue
                            ? `ℹ️ ${cancellerName} membatalkan proses mencari lawan.`
                            : `ℹ️ Party telah dibubarkan oleh ${cancellerName}.`, 'info');
                    } else showToast('ℹ️ Kamu telah dikeluarkan dari party.', 'info');
                });
            }
            // Listener partyCancelSearch: salah satu anggota membatalkan pencarian lawan
            // → semua anggota kembali ke lobi party TANPA membubarkan party
            if (currentUser) {
                const cancelSearchRef = db.ref(`users/${currentUser.uid}/partyCancelSearch`);
                cancelSearchRef.off();
                cancelSearchRef.on('value', snap => {
                    if (!snap.exists()) return;
                    const val = snap.val();
                    cancelSearchRef.remove().catch(() => {});
                    // FIX: Hapus guard floatBar — sinyal harus tetap diproses meski ada race condition timing
                    const floatBar = document.getElementById('matchmaking-float-bar');
                    const isSearching = floatBar && floatBar.style.display !== 'none';
                    if (isSearching) {
                        hideMatchmakingFloatBar();
                        stopMatchmakingCountdown();
                        if (ws) {
                            try { ws.send(JSON.stringify({ type: 'LEAVE_QUEUE' })); } catch(e) {}
                            ws.onclose = null; ws.onerror = null;
                            ws.close();
                            ws = null;
                        }
                        soundEffects.bgMusic2.pause();
                        soundEffects.bgMusic2.currentTime = 0;
                        soundEffects.bgMusic.play().catch(() => {});
                    } else if (!_isPartyGuest) {
                        return; // Host tidak sedang mencari, abaikan
                    }
                    _partyQueueSize = null;
                    // Kembalikan _partyId ke Firebase ID asli agar lobi party berfungsi
                    if (_partyFirebaseId) _partyId = _partyFirebaseId;
                    _setPresenceStatus('inLobby');
                    // Kembalikan ke lobi party (party tidak dibubarkan)
                    // Jika tamu: render ulang tampilan lobi guest dengan data yang tersimpan
                    if (_isPartyGuest && _partyHostUid && _partyHostName) {
                        _showGuestPartyLobby(_partyHostUid, _partyHostName, _myPartySlot);
                    } else {
                        document.getElementById('party-lobby-overlay').style.display = 'flex';
                    }
                    const cancellerName = val?.cancelledBy || 'Salah satu pemain';
                    showToast(`ℹ️ ${cancellerName} membatalkan pencarian lawan.`, 'info');
                    // PATCH A: Pasang ulang listener partySignal agar tamu bisa merespons
                    // jika host menekan Mulai lagi di siklus berikutnya
                    if (_isPartyGuest && _partyFirebaseId) {
                        _startPartySignalListener(_partyFirebaseId);
                    }
                });
            }
            // Listener partyRoster: deteksi host disconnect/refresh (partyRoster terhapus total)
            // sekaligus deteksi tamu lain keluar
            if (_partyGuestRosterRef) { _partyGuestRosterRef.off(); _partyGuestRosterRef = null; }
            _guestSlot3Uid = null;
            if (_partyId && currentUser) {
                _partyGuestRosterRef = db.ref(`partyRoster/${_partyId}`);
                _partyGuestRosterRef.on('value', rSnap => {
                    if (!rSnap.exists()) {
                        // partyRoster kosong total = host disconnect/refresh → bubarkan
                        if (!_isPartyGuest) return;
                        if (_partyKickRef) { _partyKickRef.off(); _partyKickRef = null; }
                        if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
                        _closeGuestPartyLobby();
                        _partyId = null; _partyQueueSize = null;
                        _setPresenceStatus('online');
                        showToast('ℹ️ Party telah dibubarkan oleh host.', 'info');
                        return;
                    }
                    // Cek apakah tamu lain (slot 3) keluar
                    if (_guestSlot3Uid && !rSnap.child(_guestSlot3Uid).exists()) {
                        _guestSlot3Uid = null;
                        if (otherSlotNum === 2) _resetSlot2();
                        else _resetSlot3();
                        showToast('ℹ️ Tamu meninggalkan party.', 'info');
                    }
                });
            }
        }

        function _closeGuestPartyLobby() {
            _isPartyGuest = false;
            _partyHostUid = null;
            _partyHostName = null;
            _myPartySlot = 2;
            if (_guestPartyStatusRef) { _guestPartyStatusRef.off(); _guestPartyStatusRef = null; }
            if (_partyKickRef) { _partyKickRef.off(); _partyKickRef = null; }
            if (_partyGuestRosterRef) { _partyGuestRosterRef.off(); _partyGuestRosterRef = null; }
            _guestSlot3Uid = null;
            _resetPartyLobbyOverlay();
            document.getElementById('party-lobby-overlay').style.display = 'none';
            _resetSlot2();
            _resetSlot3();
            // Restore tombol Mulai untuk sesi host berikutnya
            const lobbyCard = document.querySelector('.party-lobby-card');
            if (lobbyCard) lobbyCard.querySelector('.party-btn-start').style.display = '';
            // Reset slot 1 ke avatar sendiri
            const myName = currentNickname || lsGet(LS.NICKNAME) || 'Kamu';
            document.getElementById('pslot-1-name').textContent = myName;
            document.getElementById('pslot-1-icon').innerHTML = _getAvatarWithFrameHtml(54);
            // Jika sedang dalam antrian (floating bar aktif), hentikan proses dan tampilkan halaman utama kembali
            const floatBar = document.getElementById('matchmaking-float-bar');
            if (floatBar && floatBar.style.display !== 'none') {
                hideMatchmakingFloatBar();
                stopMatchmakingCountdown();
                if (ws) {
                    try { ws.send(JSON.stringify({ type: 'LEAVE_QUEUE' })); } catch(e) {}
                    ws.onclose = null; ws.onerror = null;
                    ws.close();
                    ws = null;
                }
                DOM.matchmakingScreen.classList.add('active');
                DOM.matchmakingScreen.querySelector('#matchmaking-idle').style.display = 'flex';
                DOM.matchmakingScreen.querySelector('#matchmaking-waiting').style.display = 'none';
                DOM.matchmakingScreen.style.justifyContent = 'flex-end';
                soundEffects.bgMusic2.pause();
                soundEffects.bgMusic2.currentTime = 0;
                soundEffects.bgMusic.play().catch(() => {});
            }
        }

        async function declinePartyInvite() {
            if (!currentUser) return;
            const popup = document.getElementById('party-invite-popup');
            popup.style.display = 'none';
            popup.querySelector('.party-btn-start').style.display = '';
            popup.querySelector('.party-btn-cancel').textContent = '✖ Tolak';
            // Bersihkan listener sinyal (berlaku juga saat user batal saat menunggu host)
            if (_partySignalRef) { _partySignalRef.off(); _partySignalRef = null; }
            if (_partyInviteData) {
                const inv = _partyInviteData;
                _partyInviteData = null;
                await db.ref(`users/${currentUser.uid}/partyInvite`).remove().catch(() => {});
                await db.ref(`users/${inv.fromUid}/partyStatus/${inv.partyId}/${currentUser.uid}`).set({ accepted: false }).catch(() => {});
            }
            _partyId = null;
            _partyQueueSize = null;
            _setPresenceStatus('online');
        }

        // =============================================
        // KOSTUM / CUSTOM ROOM
        // =============================================
        let _customRoomId         = null;   // room ID dari server
        let _customRoomRole       = null;   // 'pemain' | 'penonton'
        let _customRoomSlots      = [];     // filled slots [{name, uid}]
        let _customInviteData     = null;   // pending invite data
        let _customInviteRef      = null;   // Firebase listener ref
        let _customPickerSlot     = null;   // which slot index is being filled
        let _pendingCustomJoin    = false;  // menunggu konfirmasi server setelah JOIN_CUSTOM_ROOM
        let _isCustomRoomCreator  = false;  // true = user yang membuat room (bisa tambah/hapus bot)
        let _isCustomRoom         = false;  // in-game flag
        let _isSpectator          = false;  // in-game spectator flag

        function showKostumPicker() {
            if (!currentUser) { showToast('❌ Login dulu untuk fitur ini.', 'error'); return; }
            // Blokir jika ranked party lobby sedang aktif (normal atau minimized)
            if (document.getElementById('party-lobby-overlay').style.display === 'flex') {
                showToast('⚠️ Kamu sedang di lobi ranked. Tutup dulu sebelum buka kostum.', 'warning');
                restorePartyLobby();
                return;
            }
            document.getElementById('kostum-picker-overlay').style.display = 'flex';
        }
        function closeKostumPicker() {
            document.getElementById('kostum-picker-overlay').style.display = 'none';
        }

        async function selectKostumRole(role) {
            closeKostumPicker();
            _customRoomRole = role;
            _customRoomSlots = [];
            _customRoomId = null;
            _customPickerSlot = null;
            _isCustomRoomCreator = true; // user ini yang membuat room
            _setPresenceStatus('inLobby');

            // Pastikan WS tersambung sebelum kirim
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                await _ensureWsConnected();
            }
            // Validasi WS benar-benar open setelah connect
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                showToast('❌ Gagal terhubung ke server. Coba lagi.', 'error');
                _customRoomRole = null;
                return;
            }
            const myName = currentNickname || lsGet(LS.NICKNAME) || 'Player';
            ws.send(JSON.stringify({
                type: 'CREATE_CUSTOM_ROOM',
                playerName: myName,
                userUid: currentUser.uid,
                role
            }));
            // UI shown when server responds with CUSTOM_ROOM_CREATED
        }

        function _ensureWsConnected() {
            return new Promise(resolve => {
                if (ws && ws.readyState === WebSocket.OPEN) { resolve(); return; }
                // Tutup koneksi lama yang masih CONNECTING agar tidak jadi zombie
                if (ws && ws.readyState === WebSocket.CONNECTING) {
                    ws.onopen = null; ws.onclose = null; ws.onerror = null; ws.onmessage = null;
                    try { ws.close(); } catch(_) {}
                    ws = null;
                }
                ws = new WebSocket(SERVER_URL);
                ws.onopen = () => {
                    startClientKeepAlive();
                    resolve();
                };
                ws.onmessage = (e) => { try { handleServerMessage(JSON.parse(e.data)); } catch(_) {} };
                ws.onerror = () => { showToast('❌ Gagal connect ke server!', 'error'); resolve(); };
                ws.onclose = () => {
                    stopClientKeepAlive();
                    stopAutoModeTimer();
                    if (currentRoomId && myPlayerId) {
                        lsSet(LS.ROOM_ID, currentRoomId);
                        lsSet(LS.PLAYER_ID, myPlayerId);
                        lsSet(LS.GAME_ACTIVE, 'true');
                        addLog('🔄 Koneksi terputus, mencoba reconnect...');
                        reconnectAttempts = 0;
                        if (reconnectTimer) clearTimeout(reconnectTimer);
                        reconnectTimer = setTimeout(() => reconnectToGame(currentRoomId, myPlayerId), 2000);
                    } else if (_customRoomId) {
                        // WS putus saat pending custom room (belum mulai game) —
                        // server sudah cleanup room via onclose, bersihkan state client
                        // agar tidak orphaned dan memblokir showPartyLobby()
                        _customRoomSlots.forEach(s => {
                            if (s?.pending && s.uid) db.ref(`users/${s.uid}/customRoomInvite`).remove().catch(() => {});
                        });
                        if (_customInviteRef) { _customInviteRef.off(); _customInviteRef = null; }
                        _customInviteData = null;
                        _customRoomId = null;
                        _customRoomRole = null;
                        _customRoomSlots = [];
                        _customPickerSlot = null;
                        _pendingCustomJoin = false;
                        _isCustomRoomCreator = false;
                        _resetCustomRoomOverlay();
                        document.getElementById('custom-room-overlay').style.display = 'none';
                        _stopCustomPresenceListener();
                        document.getElementById('custom-friend-picker').style.display = 'none';
                        _setPresenceStatus('online');
                        _startCustomRoomInviteListener();
                        showToast('⚠️ Koneksi terputus. Lobi kostum ditutup otomatis.', 'warning');
                    }
                };
                setTimeout(resolve, 5000); // fallback timeout
            });
        }

        function _renderCustomRoomLobby() {
            const myName = currentNickname || lsGet(LS.NICKNAME) || 'Kamu';
            const isSpect = _customRoomRole === 'penonton';
            const canManageBots = _isCustomRoomCreator;

            document.getElementById('custom-room-title').textContent = isSpect ? '📺 Custom Room – Penonton' : '🎮 Custom Room – Pemain';
            document.getElementById('custom-room-subtitle').textContent = isSpect
                ? 'Kamu hanya menonton. Undang 4 pemain.'
                : 'Slot 1 = kamu. Undang teman atau isi slot dengan bot.';
            document.getElementById('custom-room-id-badge').textContent = `Kode: ${_customRoomId || '...'}`;

            const slotsDiv = document.getElementById('custom-slots');
            slotsDiv.innerHTML = '';

            // _customRoomSlots diindeks per posisi:
            // pemain : index 0 = slot 2, index 1 = slot 3, index 2 = slot 4
            // penonton: index 0 = slot 1, index 1 = slot 2, index 2 = slot 3, index 3 = slot 4
            const totalOccupied = (isSpect ? 0 : 1) + _customRoomSlots.filter(Boolean).length;

            for (let slotPos = 1; slotPos <= 4; slotPos++) {
                const slotIdx = isSpect ? (slotPos - 1) : (slotPos - 2);
                const entry = slotIdx >= 0 ? _customRoomSlots[slotIdx] : null;

                const slot = document.createElement('div');
                slot.className = 'custom-slot';

                if (!isSpect && slotPos === 1) {
                    // Slot diri sendiri (hanya pemain)
                    slot.classList.add('self');
                    slot.innerHTML = `
                        ${_getAvatarWithFrameHtml(36)}
                        <div class="custom-slot-name">${myName}</div>
                        <div class="custom-slot-tag">Kamu</div>`;
                } else if (entry?.isBot) {
                    // Slot bot
                    const levelLabel = entry.level === 1 ? 'Mudah' : entry.level === 2 ? 'Normal' : 'Sulit';
                    slot.classList.add('bot-slot');
                    slot.innerHTML = `
                        <div class="custom-slot-num">🤖</div>
                        <div class="custom-slot-name">Bot Lv${entry.level} <span style="font-size:0.75em;color:rgba(255,255,255,0.4);">(${levelLabel})</span></div>
                        ${canManageBots ? `<button class="custom-slot-clear" onclick="playSound('button');removeBotFromRoom(${slotPos})" title="Hapus bot">✖</button>` : ''}`;
                } else if (entry) {
                    // Slot teman (terisi atau pending)
                    slot.classList.add('filled');
                    const cIconId = `cslot-icon-${slotPos}`;
                    const cInit   = escHtml(entry.name.charAt(0).toUpperCase());
                    slot.innerHTML = `
                        <div id="${cIconId}" style="width:36px;height:36px;border-radius:6px;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:1em;font-weight:bold;color:white;flex-shrink:0;">${cInit}</div>
                        <div class="custom-slot-name">${escHtml(entry.name)}</div>
                        ${canManageBots ? `<button class="custom-slot-clear" onclick="playSound('button');clearCustomSlot(${slotIdx})">✖</button>` : ''}`;
                    // Fetch avatar + rank frame async (hanya slot yang sudah dikonfirmasi)
                    if (entry.uid && !entry.pending) {
                        (uid => Promise.all([
                            db.ref(`userAvatars/${uid}`).get(),
                            db.ref(`users/${uid}/rankData`).get()
                        ]).then(([avSnap, rkSnap]) => {
                            const avNum  = avSnap.exists() ? String(avSnap.val()) : '7';
                            const rkName = rkSnap.exists() ? (rkSnap.val().rankName || 'Bronze III') : 'Bronze III';
                            const fStyle = _getRankFrameStyle(rkName);
                            const el = document.getElementById(cIconId);
                            if (el) el.outerHTML = `<div style="width:36px;height:36px;border-radius:6px;overflow:hidden;${fStyle}display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f093fb,#f5576c);font-size:1em;font-weight:bold;color:white;flex-shrink:0;"><img src="${av(`gambar/avatar/avatar${avNum}.png`)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.textContent='${cInit}'"></div>`;
                        }).catch(() => {}))(entry.uid);
                    }
                } else {
                    // Slot kosong
                    if (totalOccupied >= 4) continue; // penuh, jangan tampilkan
                    if (canManageBots) {
                        slot.innerHTML = `
                            <div class="custom-slot-num">${slotPos}</div>
                            <div class="custom-slot-empty-text">Klik untuk undang teman</div>`;
                        slot.onclick = () => { playSound('button'); openCustomFriendPicker(slotPos); };
                    } else {
                        slot.innerHTML = `
                            <div class="custom-slot-num">${slotPos}</div>
                            <div class="custom-slot-empty-text" style="opacity:0.4;">Menunggu pemain...</div>`;
                    }
                }
                slotsDiv.appendChild(slot);
            }

            // Update tombol Mulai — hanya hitung slot confirmed (bukan pending invite)
            const confirmedCount = (isSpect ? 0 : 1) + _customRoomSlots.filter(s => s && !s.pending).length;
            const _btnStart = document.getElementById('btn-custom-start');
            _btnStart.disabled = confirmedCount < 2;
            _btnStart.textContent = '▶ Mulai';
        }

        async function openCustomFriendPicker(slotPos) {
            _customPickerSlot = slotPos; // slot position 1-4
            const picker = document.getElementById('custom-friend-picker');
            picker.style.display = 'block';
            const listDiv = document.getElementById('custom-friend-list');

            // ── Bagian pilih Bot ──────────────────────────────
            const isSpect = _customRoomRole === 'penonton';
            const totalOccupied = (isSpect ? 0 : 1) + _customRoomSlots.filter(Boolean).length;
            const canAddBot = totalOccupied < 4;
            let html = `<div class="custom-friend-picker-title" style="margin-top:4px;">🤖 Isi slot dengan Bot:</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">`;
            if (canAddBot) {
                html += `
                    <button class="custom-friend-btn" style="background:rgba(251,191,36,0.15);border-color:rgba(251,191,36,0.5);color:#fbbf24;"
                        onclick="playSound('button');addBotToRoomSlot(1)">🤖 Mudah (Lv1)</button>
                    <button class="custom-friend-btn" style="background:rgba(251,191,36,0.15);border-color:rgba(251,191,36,0.5);color:#fbbf24;"
                        onclick="playSound('button');addBotToRoomSlot(2)">🤖 Normal (Lv2)</button>
                    <button class="custom-friend-btn" style="background:rgba(251,191,36,0.15);border-color:rgba(251,191,36,0.5);color:#fbbf24;"
                        onclick="playSound('button');addBotToRoomSlot(3)">🤖 Sulit (Lv3)</button>`;
            } else {
                html += `<div style="color:rgba(255,255,255,0.35);font-size:0.78em;">Slot penuh (maks 4)</div>`;
            }
            html += `</div><div class="custom-friend-picker-title">👥 Daftar Teman:</div>`;
            listDiv.innerHTML = html + '<div style="color:rgba(255,255,255,0.4);font-size:0.82em;padding:4px 0;">⏳ Memuat...</div>';

            // ── Bagian daftar semua teman ─────────────────────
            if (!currentUser) return;
            // Cleanup listener lama jika ada
            if (_customPresenceRef && _customPresenceCb) {
                _customPresenceRef.off('value', _customPresenceCb);
                _customPresenceRef = null; _customPresenceCb = null;
            }
            try {
                const myFriendsSnap = await db.ref(`users/${currentUser.uid}/friends`).get();
                const friendsSection = listDiv.querySelector('div:last-child');
                if (!myFriendsSnap.exists()) {
                    if (friendsSection) friendsSection.textContent = 'Belum ada teman.';
                    return;
                }
                const friends = myFriendsSnap.val();
                const uids = Object.keys(friends);
                // Fetch semua nickname sekali
                const profiles = await Promise.all(uids.map(uid =>
                    db.ref(`users/${uid}/nickname`).get().then(s => ({ uid, nickname: s.val() || 'Unknown' }))
                ));
                if (friendsSection) friendsSection.remove();

                // Fungsi render menggunakan data presence terbaru
                function renderCustomWithPresence(presence) {
                    const invitedUids = _customRoomSlots.filter(s => s && !s.isBot).map(s => s.uid);
                    invitedUids.push(currentUser.uid);
                    const sorted = [...profiles].sort((a, b) => {
                        const aOk = presence[a.uid]?.online && !presence[a.uid]?.status && !invitedUids.includes(a.uid) ? 0 : 1;
                        const bOk = presence[b.uid]?.online && !presence[b.uid]?.status && !invitedUids.includes(b.uid) ? 0 : 1;
                        return aOk - bOk;
                    });
                    // Hapus semua item teman lama (setelah bot section)
                    const existing = listDiv.querySelectorAll('.custom-friend-item');
                    existing.forEach(el => el.remove());
                    if (!sorted.length) {
                        listDiv.insertAdjacentHTML('beforeend', '<div style="color:rgba(255,255,255,0.4);font-size:0.82em;padding:4px 0;">Belum ada teman.</div>');
                        return;
                    }
                    for (const f of sorted) {
                        const pres = presence[f.uid];
                        const isInRoom = invitedUids.includes(f.uid);
                        let canInvite = false, statusLabel = '', statusColor = '';
                        if (isInRoom) {
                            statusLabel = '✅ Sudah di room'; statusColor = 'rgba(76,175,80,0.9)';
                        } else if (!pres?.online) {
                            statusLabel = '⚫ Offline'; statusColor = 'rgba(255,255,255,0.35)';
                        } else if (pres.status === 'inGame') {
                            statusLabel = '🎮 Sedang bermain'; statusColor = 'rgba(244,67,54,0.9)';
                        } else if (pres.status === 'inQueue') {
                            statusLabel = '🔍 Mencari lawan'; statusColor = 'rgba(255,193,7,0.9)';
                        } else if (pres.status === 'inLobby') {
                            statusLabel = '🚪 Sedang di lobby'; statusColor = 'rgba(255,193,7,0.9)';
                        } else {
                            canInvite = true; statusLabel = '🟢 Online'; statusColor = 'rgba(76,175,80,0.9)';
                        }
                        const item = document.createElement('div');
                        item.className = 'custom-friend-item';
                        item.style.opacity = canInvite ? '' : '0.52';
                        item.innerHTML = `
                            <div style="flex:1;min-width:0;">
                                <div class="custom-friend-name">${escHtml(f.nickname)}</div>
                                <div style="font-size:0.72em;color:${statusColor};margin-top:2px;">${statusLabel}</div>
                            </div>
                            ${canInvite ? `<button class="custom-friend-btn" onclick="playSound('button');inviteToCustomRoom('${escHtml(f.uid)}','${escHtml(f.nickname).replace(/'/g,"\\'")}',${slotPos})">Undang</button>` : ''}`;
                        listDiv.appendChild(item);
                    }
                }

                // Set up real-time listener pada node presence
                _customPresenceRef = db.ref('presence');
                _customPresenceCb = (presSnap) => {
                    const presence = presSnap.exists() ? presSnap.val() : {};
                    renderCustomWithPresence(presence);
                };
                _customPresenceRef.on('value', _customPresenceCb);
            } catch(e) {
                listDiv.insertAdjacentHTML('beforeend', '<div style="color:rgba(255,255,255,0.4);font-size:0.82em;padding:4px 0;">Gagal memuat.</div>');
            }
        }

        function _stopCustomPresenceListener() {
            if (_customPresenceRef && _customPresenceCb) {
                _customPresenceRef.off('value', _customPresenceCb);
                _customPresenceRef = null; _customPresenceCb = null;
            }
        }

        function addBotToRoomSlot(level) {
            // Simpan slot sebelum null-kan, lalu kirim ADD_BOT_SLOT ke server
            _stopCustomPresenceListener();
            document.getElementById('custom-friend-picker').style.display = 'none';
            addBotToRoom(level); // addBotToRoom baca _customPickerSlot sebelum di-null
            _customPickerSlot = null;
        }

        async function inviteToCustomRoom(uid, name, slotPos) {
            if (!currentUser || !_customRoomId) return;
            _stopCustomPresenceListener();
            document.getElementById('custom-friend-picker').style.display = 'none';
            // Send Firebase invite
            const myName = currentNickname || lsGet(LS.NICKNAME) || 'Player';
            const customInviteRef = db.ref(`users/${uid}/customRoomInvite`);
            await customInviteRef.set({
                roomId: _customRoomId,
                fromUid: currentUser.uid,
                fromName: myName,
                role: 'pemain',
                ts: Date.now()
            }).catch(() => {});
            // Auto-hapus jika host disconnect (crash/tutup tab)
            customInviteRef.onDisconnect().remove();
            // Optimistically mark slot as pending — gunakan slotIdx berbasis posisi
            const isSpect = _customRoomRole === 'penonton';
            const slotIdx = isSpect ? (slotPos - 1) : (slotPos - 2);
            _customRoomSlots[slotIdx] = { name: `${name} (menunggu...)`, uid, pending: true };
            _renderCustomRoomLobby();
        }

        function clearCustomSlot(slotIndex) {
            if (_customRoomSlots[slotIndex]) {
                const uid = _customRoomSlots[slotIndex].uid;
                if (_customRoomSlots[slotIndex].pending) {
                    // Undangan masih pending → batalkan via Firebase
                    db.ref(`users/${uid}/customRoomInvite`).remove().catch(() => {});
                } else if (uid && ws && ws.readyState === WebSocket.OPEN) {
                    // Pemain sudah join → kick via WebSocket; UI diupdate saat CUSTOM_ROOM_UPDATE tiba
                    ws.send(JSON.stringify({ type: 'KICK_FROM_ROOM', roomId: _customRoomId, targetUid: uid }));
                    _stopCustomPresenceListener();
                    document.getElementById('custom-friend-picker').style.display = 'none';
                    return;
                }
                _customRoomSlots[slotIndex] = null;
            }
            _stopCustomPresenceListener();
            document.getElementById('custom-friend-picker').style.display = 'none';
            _renderCustomRoomLobby();
        }

        function startCustomRoomGame() {
            if (!ws || ws.readyState !== WebSocket.OPEN || !_customRoomId) return;
            // Batalkan semua undangan Firebase yang masih pending (belum dijawab)
            // agar teman yang belum jawab tidak bisa terima undangan yang sudah tidak berlaku
            _customRoomSlots.forEach(s => {
                if (s?.pending && s.uid) db.ref(`users/${s.uid}/customRoomInvite`).remove().catch(() => {});
            });
            // Ganti musik ke game music
            try {
                soundEffects.bgMusic.pause();
                soundEffects.bgMusic2.currentTime = 0;
                soundEffects.bgMusic2.play().catch(() => {});
            } catch(e) {}
            ws.send(JSON.stringify({ type: 'START_CUSTOM_ROOM', userUid: currentUser ? currentUser.uid : '' }));
            document.getElementById('btn-custom-start').disabled = true;
            document.getElementById('btn-custom-start').textContent = '⏳ Memulai...';
        }

        function leaveCustomRoom() {
            _setPresenceStatus('online');
            if (ws && ws.readyState === WebSocket.OPEN && _customRoomId) {
                ws.send(JSON.stringify({ type: 'LEAVE_CUSTOM_ROOM', userUid: currentUser ? currentUser.uid : '' }));
            }
            // Batalkan semua undangan yang masih pending
            _customRoomSlots.forEach(s => {
                if (s?.pending && s.uid) db.ref(`users/${s.uid}/customRoomInvite`).remove().catch(() => {});
            });
            // Bersihkan Firebase listener undangan masuk (jika sedang jadi penerima)
            if (_customInviteRef) { _customInviteRef.off(); _customInviteRef = null; }
            _customInviteData = null;
            _customRoomId = null;
            _customRoomRole = null;
            _customRoomSlots = [];
            _customPickerSlot = null;
            _pendingCustomJoin = false;
            _isCustomRoomCreator = false;
            _resetCustomRoomOverlay();
            document.getElementById('custom-room-overlay').style.display = 'none';
            _stopCustomPresenceListener();
            document.getElementById('custom-friend-picker').style.display = 'none';
            _startCustomRoomInviteListener(); // restart listener agar undangan berikutnya tetap muncul
        }

        // Handle CUSTOM_ROOM_UPDATE from server (player joined / bot slot changed)
        function _handleCustomRoomUpdate(data) {
            // data.slots = [{slot, name, uid, isBot?, level?}]
            if (!data.slots) return;
            const isSpect = _customRoomRole === 'penonton';
            const myUid   = currentUser ? currentUser.uid : null;
            const prevSlots = _customRoomSlots.slice();

            if (isSpect) {
                // Penonton: semua 4 slot berdasarkan posisi server
                const newSlots = new Array(4).fill(null);
                data.slots.forEach(s => {
                    const idx = s.slot - 1;
                    if (idx < 0 || idx >= 4) return;
                    newSlots[idx] = s.isBot
                        ? { name: s.name, uid: null, isBot: true, level: s.level }
                        : { name: s.name, uid: s.uid };
                });
                for (let i = 0; i < 4; i++) {
                    if (!newSlots[i] && _customRoomSlots[i]?.pending) newSlots[i] = _customRoomSlots[i];
                }
                _customRoomSlots = newSlots;
            } else {
                // Pemain: slot 1 UI selalu "Kamu" — exclude UID sendiri, urutkan sisanya
                const others = data.slots
                    .filter(s => s.isBot || s.uid !== myUid)
                    .sort((a, b) => a.slot - b.slot);
                const newSlots = new Array(3).fill(null);
                others.forEach((s, i) => {
                    if (i >= 3) return;
                    newSlots[i] = s.isBot
                        ? { name: s.name, uid: null, isBot: true, level: s.level }
                        : { name: s.name, uid: s.uid };
                });
                // Pertahankan pending invite di slot yang belum dikonfirmasi server
                for (let i = 0; i < 3; i++) {
                    if (!newSlots[i] && _customRoomSlots[i]?.pending) newSlots[i] = _customRoomSlots[i];
                }
                _customRoomSlots = newSlots;
            }
            // Detect new human players joining (not self, not bot, not pending)
            const prevUids = new Set(prevSlots.filter(s => s && !s.isBot && s.uid).map(s => s.uid));
            const newHumans = _customRoomSlots.filter(s => s && !s.isBot && s.uid && !s.pending && !prevUids.has(s.uid) && s.uid !== myUid);
            if (newHumans.length > 0) {
                playSound('invite');
                newHumans.forEach(p => showToast(`✅ ${p.name} bergabung ke lobi!`, 'success'));
            }
            _renderCustomRoomLobby();
        }

        function addBotToRoom(level) {
            if (!ws || ws.readyState !== WebSocket.OPEN || !_customRoomId) return;
            ws.send(JSON.stringify({ type: 'ADD_BOT_SLOT', level, slotPosition: _customPickerSlot, userUid: currentUser ? currentUser.uid : '' }));
        }

        function removeBotFromRoom(slotPos) {
            if (!ws || ws.readyState !== WebSocket.OPEN || !_customRoomId) return;
            ws.send(JSON.stringify({ type: 'REMOVE_BOT_SLOT', slotPosition: slotPos, userUid: currentUser ? currentUser.uid : '' }));
        }

        // Listen for incoming custom room invites (for friends)
        function _startCustomRoomInviteListener() {
            if (!currentUser) return;
            if (_customInviteRef) _customInviteRef.off();
            _customInviteRef = db.ref(`users/${currentUser.uid}/customRoomInvite`);
            _customInviteRef.on('value', snap => {
                if (!snap.exists()) {
                    document.getElementById('custom-room-invite-popup').style.display = 'none';
                    _customInviteData = null; // Hapus data lama agar klik "Terima" terlambat tidak diproses
                    return;
                }
                const inv = snap.val();
                // Abaikan undangan yang tidak punya timestamp (data lama dari sesi sebelumnya)
                if (!inv.ts) {
                    db.ref(`users/${currentUser.uid}/customRoomInvite`).remove();
                    return;
                }
                // Abaikan undangan lebih dari 2 menit (invite basi — game mungkin sudah selesai)
                if (Date.now() - inv.ts > 120000) {
                    db.ref(`users/${currentUser.uid}/customRoomInvite`).remove();
                    return;
                }
                _customInviteData = inv;
                document.getElementById('custom-invite-msg').textContent =
                    `${inv.fromName || 'Seorang teman'} mengundangmu ke custom room!`;
                document.getElementById('custom-room-invite-popup').style.display = 'flex';
            });
        }

        async function acceptCustomRoomInvite() {
            if (!_customInviteData || !currentUser) return;

            // Tolak jika sedang aktif di game, party lobby, atau custom room lain
            if (currentRoomId) {
                showToast('⚠️ Kamu sedang dalam pertandingan. Selesaikan dulu.', 'warning');
                return;
            }
            // Blokir jika sedang di ranked party lobby (host atau tamu, normal atau minimized)
            if (document.getElementById('party-lobby-overlay').style.display === 'flex') {
                showToast('⚠️ Kamu sedang di lobi ranked. Tutup dulu sebelum menerima undangan kostum.', 'warning');
                restorePartyLobby();
                return;
            }
            if (_customRoomId) {
                if (_customRoomId !== _customInviteData.roomId) {
                    showToast('⚠️ Kamu sudah ada di custom room. Keluar dulu.', 'warning');
                    return;
                }
                // _customRoomId === inv.roomId: race condition — player di-kick tapi Firebase invite
                // tiba sebelum KICKED_FROM_ROOM WebSocket message. Bersihkan state lama dan lanjut.
                _customRoomId = null;
                _customRoomRole = null;
                _customRoomSlots = [];
                _pendingCustomJoin = false;
                _isCustomRoomCreator = false;
            }

            const inv = _customInviteData;
            _customInviteData = null;
            document.getElementById('custom-room-invite-popup').style.display = 'none';

            // Validasi: pastikan undangan masih ada di Firebase
            // (bisa sudah dihapus jika host sudah tekan Mulai atau keluar room)
            const stillValid = await db.ref(`users/${currentUser.uid}/customRoomInvite`)
                .get().then(s => s.exists()).catch(() => false);
            if (!stillValid) {
                showToast('⚠️ Undangan sudah tidak berlaku (pertandingan mungkin sudah dimulai).', 'warning');
                return;
            }

            await db.ref(`users/${currentUser.uid}/customRoomInvite`).remove().catch(() => {});

            try {
                // Sambungkan WS lalu kirim JOIN — jangan tampilkan lobby dulu, tunggu konfirmasi server
                await _ensureWsConnected();
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                    showToast('❌ Gagal terhubung ke server. Coba lagi.', 'error');
                    return;
                }
                _customRoomId = inv.roomId;
                _customRoomRole = 'pemain';
                _customRoomSlots = [];
                _pendingCustomJoin = true;
                _isCustomRoomCreator = false; // bergabung sebagai tamu, bukan pencipta room
                _setPresenceStatus('inLobby');
                showToast('⏳ Bergabung ke custom room...', 'info');
                const myName = currentNickname || lsGet(LS.NICKNAME) || 'Player';
                ws.send(JSON.stringify({
                    type: 'JOIN_CUSTOM_ROOM',
                    roomId: inv.roomId,
                    playerName: myName,
                    userUid: currentUser.uid
                }));
                // Lobby hanya ditampilkan setelah CUSTOM_ROOM_UPDATE diterima (join berhasil)
            } catch (e) {
                showToast('❌ Gagal bergabung. Silakan coba lagi.', 'error');
                _pendingCustomJoin = false;
                _customRoomId = null;
                _customRoomRole = null;
                _customRoomSlots = [];
            }
        }

        async function declineCustomRoomInvite() {
            if (!_customInviteData || !currentUser) return;
            document.getElementById('custom-room-invite-popup').style.display = 'none';
            _customInviteData = null;
            await db.ref(`users/${currentUser.uid}/customRoomInvite`).remove().catch(() => {});
        }

        // Nav bar scroll for menu buttons
        let _menuNavIndex = 0;
        function scrollMenuNav(dir) {
            const btns = document.querySelectorAll('#menu-nav-inner .btn-encyclopedia');
            const total = btns.length;
            const scrollEl = document.getElementById('menu-nav-scroll');
            const inner = document.getElementById('menu-nav-inner');
            if (!btns[0] || !scrollEl) return;
            const btnWidth = btns[0].offsetWidth + 10; // button width + gap
            const visible = Math.max(1, Math.floor((scrollEl.offsetWidth + 10) / btnWidth));
            _menuNavIndex = Math.max(0, Math.min(_menuNavIndex + dir, total - visible));
            inner.style.transform = `translateX(-${_menuNavIndex * btnWidth}px)`;
            const arrows = document.querySelectorAll('.menu-nav-arrow');
            arrows[0].style.visibility = _menuNavIndex === 0 ? 'hidden' : 'visible';
            arrows[1].style.visibility = _menuNavIndex >= total - visible ? 'hidden' : 'visible';
        }
        // Init arrow states on load and re-sync on resize
        document.addEventListener('DOMContentLoaded', function() {
            const arrows = document.querySelectorAll('.menu-nav-arrow');
            if (arrows.length >= 2) arrows[0].style.visibility = 'hidden'; // hide left arrow initially
        });
        window.addEventListener('resize', function() {
            _menuNavIndex = 0;
            scrollMenuNav(0);
        });

        function showEncTab(tab) {
            document.getElementById('enc-tab-btn-cards').classList.toggle('active', tab === 'cards');
            document.getElementById('enc-tab-btn-rules').classList.toggle('active', tab === 'rules');
            document.getElementById('enc-tab-cards').classList.toggle('active', tab === 'cards');
            document.getElementById('enc-tab-rules').classList.toggle('active', tab === 'rules');
        }

        let _encDropdownClickHandler = null; // referensi handler global untuk tutup dropdown
        function renderEncFilter() {
            const filterDiv = document.getElementById('enc-prov-filter');
            if (!filterDiv) return;
            filterDiv.innerHTML = '';

            let currentFilter = 'Semua';

            // Wrapper dropdown
            const wrap = document.createElement('div');
            wrap.className = 'enc-prov-dropdown-wrap';

            // Tombol utama
            const mainBtn = document.createElement('button');
            mainBtn.className = 'enc-prov-dropdown-btn';
            mainBtn.innerHTML = '🌏 Semua Provinsi <span class="enc-prov-arrow">▼</span>';

            // Daftar dropdown
            const list = document.createElement('div');
            list.className = 'enc-prov-list';

            function setFilter(name, label) {
                currentFilter = name;
                mainBtn.innerHTML = `🌏 ${label} <span class="enc-prov-arrow">▼</span>`;
                list.querySelectorAll('.enc-prov-list-item').forEach(el => {
                    el.classList.toggle('active', el.dataset.name === name);
                });
                renderEncCards(name);
                list.classList.remove('open');
                mainBtn.classList.remove('open');
            }

            // Item "Semua Provinsi"
            const allItem = document.createElement('div');
            allItem.className = 'enc-prov-list-item active';
            allItem.dataset.name = 'Semua';
            allItem.textContent = '🌏 Semua Provinsi';
            allItem.onclick = () => { playSound('button'); setFilter('Semua', 'Semua Provinsi'); };
            list.appendChild(allItem);

            // Item per provinsi
            provinces.forEach(prov => {
                const item = document.createElement('div');
                item.className = 'enc-prov-list-item';
                item.dataset.name = prov.name;
                item.textContent = prov.name;
                item.onclick = () => { playSound('button'); setFilter(prov.name, prov.name); };
                list.appendChild(item);
            });

            // Toggle dropdown saat tombol diklik
            mainBtn.onclick = (e) => {
                e.stopPropagation();
                playSound('button');
                const isOpen = list.classList.contains('open');
                list.classList.toggle('open', !isOpen);
                mainBtn.classList.toggle('open', !isOpen);
            };

            // Tutup dropdown saat klik di luar — lepas handler lama agar tidak menumpuk
            if (_encDropdownClickHandler) document.removeEventListener('click', _encDropdownClickHandler);
            _encDropdownClickHandler = () => {
                list.classList.remove('open');
                mainBtn.classList.remove('open');
            };
            document.addEventListener('click', _encDropdownClickHandler);

            wrap.appendChild(mainBtn);
            wrap.appendChild(list);
            filterDiv.appendChild(wrap);
        }

        function renderEncCards(filter) {
            const container = document.getElementById('enc-cards-container');
            if (!container) return;
            container.innerHTML = '';

            const toShow = filter === 'Semua' ? provinces : provinces.filter(p => p.name === filter);

            toShow.forEach(prov => {
                const section = document.createElement('div');
                section.className = 'enc-province-section';

                const header = document.createElement('div');
                header.className = 'enc-province-name';
                const imgSrc = av(`gambar/provinsi/${prov.name}/peta (${prov.name}).png`);
                header.innerHTML = `<img src="${imgSrc}" alt="Peta ${prov.name}" class="enc-province-img" onerror="this.style.display='none'">${prov.name} <span style="font-size:0.72em;opacity:0.55;font-weight:normal;margin-left:4px;">(${prov.cards.length} kartu)</span>`;
                section.appendChild(header);

                const cardsRow = document.createElement('div');
                cardsRow.className = 'enc-cards-row';

                [...prov.cards].sort((a, b) => b.power - a.power).forEach(cardData => {
                    const fullCard = { ...cardData, id: 'enc_' + cardData.name, province: prov.name };
                    const cardEl = createCardElement(fullCard);
                    cardEl.style.cursor = 'default';
                    cardEl.classList.add('locked');

                    const wrapper = document.createElement('div');
                    wrapper.className = 'enc-card-wrapper';

                    const powerBadge = document.createElement('div');
                    powerBadge.className = 'enc-power-badge';
                    powerBadge.textContent = '⚡ Power ' + cardData.power;

                    const rarityLabels = {
                        mythic:      '👑 Mythic',
                        legendary:   '🔥 Legendary',
                        epic:        '👾 Epic',
                        rareplus:    '💎 Rare+',
                        rarestar:    '💙 Rare★',
                        rare:        '💠 Rare',
                        uncommon:    '💚 Uncommon',
                        uncommonplus:'🍀 Uncommon+',
                        commonplus:  '🟢 Common+',
                        common:      '⚪ Common'
                    };
                    const rarityBadge = document.createElement('div');
                    rarityBadge.className = `enc-rarity-badge ${cardData.rarity}`;
                    rarityBadge.textContent = rarityLabels[cardData.rarity] || cardData.rarity;

                      wrapper.appendChild(cardEl);
                    wrapper.appendChild(powerBadge);
                    wrapper.appendChild(rarityBadge);
                    cardsRow.appendChild(wrapper);
                });

                section.appendChild(cardsRow);
                container.appendChild(section);
            });
        }
    </script>

    <!-- PARTY LOBBY POPUP -->
    <div id="party-lobby-overlay" style="display:none;">
        <div class="party-lobby-card">
            <button class="lobby-minimize-btn" onclick="playSound('button');minimizePartyLobby()" title="Perkecil">—</button>
            <div class="party-lobby-title">🎮 Ranked</div>

            <!-- Tiga slot pemain -->
            <div class="party-slots">
                <!-- Slot 1: Player sendiri -->
                <div class="party-slot filled" id="pslot-1">
                    <div class="party-slot-icon" id="pslot-1-icon">👤</div>
                    <div class="party-slot-name" id="pslot-1-name">Kamu</div>
                </div>

                <div class="party-vs-divider">+</div>

                <!-- Slot 2: Teman 1 (opsional) -->
                <div class="party-slot empty" id="pslot-2" onclick="playSound('button');togglePartyFriendPicker(2)">
                    <button class="party-slot-clear" id="pslot-2-clear"
                        onclick="event.stopPropagation();playSound('button');clearPartyFriend(2)" style="display:none;">✖</button>
                    <div class="party-slot-icon" id="pslot-2-icon">➕</div>
                    <div class="party-slot-name" id="pslot-2-name">Ajak Teman</div>
                    <div class="party-slot-sub" id="pslot-2-sub">(opsional)</div>
                </div>

                <div class="party-vs-divider">+</div>

                <!-- Slot 3: Teman 2 (opsional) -->
                <div class="party-slot empty" id="pslot-3" onclick="playSound('button');togglePartyFriendPicker(3)">
                    <button class="party-slot-clear" id="pslot-3-clear"
                        onclick="event.stopPropagation();playSound('button');clearPartyFriend(3)" style="display:none;">✖</button>
                    <div class="party-slot-icon" id="pslot-3-icon">➕</div>
                    <div class="party-slot-name" id="pslot-3-name">Ajak Teman</div>
                    <div class="party-slot-sub" id="pslot-3-sub">(opsional)</div>
                </div>
            </div>

            <!-- Friend Picker (tersembunyi sampai slot diklik) -->
            <div id="party-friend-picker" style="display:none;">
                <div class="party-picker-title">Pilih Teman</div>
                <div class="party-friend-list" id="party-friend-list">
                    <div style="color:rgba(255,255,255,0.5);font-size:0.85em;padding:6px 0;">⏳ Memuat...</div>
                </div>
            </div>

            <div class="party-lobby-actions">
                <button class="party-btn-cancel" onclick="playSound('x');closePartyLobby()">✖ Batal</button>
                <button class="party-btn-start" onclick="playSound('button');startMatchmakingFromParty()">▶ Mulai</button>
            </div>
        </div>
    </div>

    <!-- PARTY INVITE POPUP (muncul di layar teman yang diundang) -->
    <div id="party-invite-popup" style="display:none;">
        <div class="party-lobby-card">
            <div class="party-lobby-title">🎮 Ajakan Main Bareng!</div>
            <p class="party-invite-msg" id="party-invite-msg">Seseorang mengajakmu main bareng!</p>
            <div class="party-lobby-actions">
                <button class="party-btn-cancel" onclick="playSound('x');declinePartyInvite()">✖ Tolak</button>
                <button class="party-btn-start" onclick="playSound('button');acceptPartyInvite()">✅ Terima</button>
            </div>
        </div>
    </div>

    <!-- KOSTUM: ROLE PICKER POPUP -->
    <div id="kostum-picker-overlay" style="display:none;">
        <div class="kostum-picker-card">
            <div class="kostum-picker-title">⚔️ Mode Kostum</div>
            <div class="kostum-picker-sub">Pertandingan tidak mempengaruhi rank, riwayat, atau statistik.</div>
            <div class="kostum-role-btns">
                <button class="kostum-role-btn pemain" onclick="playSound('button');selectKostumRole('pemain')">
                    <span class="role-icon">🎮</span>
                    <span class="role-label">Pemain</span>
                    <span class="role-desc">Ikut bermain dalam pertandingan</span>
                </button>
                <button class="kostum-role-btn penonton" onclick="playSound('button');selectKostumRole('penonton')">
                    <span class="role-icon">📺</span>
                    <span class="role-label">Penonton</span>
                    <span class="role-desc">Hanya menonton, undang 4 pemain</span>
                </button>
            </div>
            <button class="btn-kostum-cancel" onclick="playSound('x');closeKostumPicker()">✖ Batal</button>
        </div>
    </div>

    <!-- KOSTUM: CUSTOM ROOM LOBBY -->
    <div id="custom-room-overlay" style="display:none;">
        <div class="custom-room-card">
            <button class="lobby-minimize-btn" onclick="playSound('button');minimizeCustomRoom()" title="Perkecil">—</button>
            <div class="custom-room-title" id="custom-room-title">⚔️ Custom Room</div>
            <div class="custom-room-subtitle" id="custom-room-subtitle">Undang teman untuk bermain bersama</div>
            <div class="custom-room-badge" id="custom-room-id-badge">Kode: —</div>
            <div class="custom-slots" id="custom-slots">
                <!-- Slots filled by JS -->
            </div>
            <div id="custom-friend-picker" style="display:none;">
                <div class="custom-friend-picker">
                    <div class="custom-friend-picker-title">Pilih teman online:</div>
                    <div id="custom-friend-list"></div>
                </div>
            </div>
            <div class="custom-room-actions">
                <button class="btn-custom-cancel" onclick="playSound('x');leaveCustomRoom()">✖ Keluar</button>
                <button class="btn-custom-start" id="btn-custom-start" onclick="playSound('button');startCustomRoomGame()">▶ Mulai</button>
            </div>
        </div>
    </div>

    <!-- KOSTUM: CUSTOM ROOM INVITE POPUP (untuk penerima undangan) -->
    <div id="custom-room-invite-popup" style="display:none;">
        <div class="party-lobby-card">
            <div class="party-lobby-title">🤝 Undangan Custom Room!</div>
            <p class="party-invite-msg" id="custom-invite-msg">Seseorang mengundangmu ke custom room!</p>
            <div class="party-lobby-actions">
                <button class="party-btn-cancel" onclick="playSound('x');declineCustomRoomInvite()">✖ Tolak</button>
                <button class="party-btn-start" onclick="playSound('button');acceptCustomRoomInvite()">✔ Terima</button>
            </div>
        </div>
    </div>

    <!-- PARTY LOBBY MINIMIZED BUBBLE -->
    <div id="party-lobby-bubble" class="lobby-bubble" onclick="playSound('button');restorePartyLobby()">
        <span class="lobby-bubble-icon">🎮</span>
        <div class="lobby-bubble-info">
            <span class="lobby-bubble-label">Ranked Lobby</span>
            <span class="lobby-bubble-sub">Menunggu teman…</span>
        </div>
        <span class="lobby-bubble-dot"></span>
    </div>

    <!-- CUSTOM ROOM MINIMIZED BUBBLE -->
    <div id="custom-lobby-bubble" class="lobby-bubble" onclick="playSound('button');restoreCustomRoom()">
        <span class="lobby-bubble-icon">⚔️</span>
        <div class="lobby-bubble-info">
            <span class="lobby-bubble-label">Custom Room</span>
            <span class="lobby-bubble-sub">Menunggu pemain…</span>
        </div>
        <span class="lobby-bubble-dot"></span>
    </div>

    <!-- FLOATING MATCHMAKING BAR -->
    <div id="matchmaking-float-bar" style="display:none;">
        <span class="mf-icon">🔍</span>
        <div class="mf-info">
            <span class="mf-label">Mencari Lawan...</span>
            <span class="mf-timer" id="mf-timer">00:00</span>
        </div>
        <button class="mf-cancel-btn" onclick="playSound('x');cancelMatchmaking()">✕</button>
    </div>

    <!-- TOAST CONTAINER -->
    <div id="toast-container"></div>

    <!-- AVATAR PICKER OVERLAY -->
    <div id="avatar-picker-overlay" onclick="if(event.target===this){playSound('x');hideAvatarPicker();}">
        <div id="avatar-picker-box">
            <h3>🖼️ Pilih Foto Profil</h3>
            <div class="avatar-grid">
                <div class="avatar-option" id="av-opt-0" onclick="playSound('button');selectAvatar(0)"><img src="gambar/avatar/avatar1.png?v=1.0" alt="Avatar 1" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-1" onclick="playSound('button');selectAvatar(1)"><img src="gambar/avatar/avatar2.png?v=1.0" alt="Avatar 2" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-2" onclick="playSound('button');selectAvatar(2)"><img src="gambar/avatar/avatar3.png?v=1.0" alt="Avatar 3" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-3" onclick="playSound('button');selectAvatar(3)"><img src="gambar/avatar/avatar4.png?v=1.0" alt="Avatar 4" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-4" onclick="playSound('button');selectAvatar(4)"><img src="gambar/avatar/avatar5.png?v=1.0" alt="Avatar 5" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-5" onclick="playSound('button');selectAvatar(5)"><img src="gambar/avatar/avatar6.png?v=1.0" alt="Avatar 6" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-6" onclick="playSound('button');selectAvatar(6)"><img src="gambar/avatar/avatar7.png?v=1.0" alt="Avatar 7" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-7" onclick="playSound('button');selectAvatar(7)"><img src="gambar/avatar/avatar8.png?v=1.0" alt="Avatar 8" onerror="this.parentElement.textContent='👤'"></div>
                <div class="avatar-option" id="av-opt-8" onclick="playSound('button');selectAvatar(8)"><img src="gambar/avatar/avatar9.png?v=1.0" alt="Avatar 9" onerror="this.parentElement.textContent='👤'"></div>
            </div>
            <button id="btn-avatar-close" onclick="playSound('x');hideAvatarPicker()">✕ Tutup</button>
        </div>
    </div>
</body>
</html>
<script>
// =============================================
// FLOATING MATCHMAKING BAR - TIMER
// =============================================
let _mfTimerInterval = null;

function showMatchmakingFloatBar() {
    const bar = document.getElementById('matchmaking-float-bar');
    if (!bar) return;
    bar.style.display = 'flex';
    // Disable tombol Ranked dan Kostum saat mencari lawan
    const btnRanked = document.querySelector('.btn-start');
    const btnKostum = document.querySelector('.btn-kostum-style');
    if (btnRanked) { btnRanked.disabled = true; btnRanked.style.opacity = '0.4'; btnRanked.style.cursor = 'not-allowed'; btnRanked.title = 'Batalkan proses mencari lawan terlebih dahulu'; }
    if (btnKostum) { btnKostum.disabled = true; btnKostum.style.opacity = '0.4'; btnKostum.style.cursor = 'not-allowed'; btnKostum.title = 'Batalkan proses mencari lawan terlebih dahulu'; }
    let totalSecs = 0;
    clearInterval(_mfTimerInterval);
    _mfTimerInterval = setInterval(() => {
        totalSecs++;
        const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
        const s = String(totalSecs % 60).padStart(2, '0');
        const el = document.getElementById('mf-timer');
        if (el) el.textContent = `${m}:${s}`;
    }, 1000);
}

function hideMatchmakingFloatBar() {
    const bar = document.getElementById('matchmaking-float-bar');
    if (bar) bar.style.display = 'none';
    clearInterval(_mfTimerInterval);
    _mfTimerInterval = null;
    const el = document.getElementById('mf-timer');
    if (el) el.textContent = '00:00';
    // Re-enable tombol Ranked dan Kostum
    const btnRanked = document.querySelector('.btn-start');
    const btnKostum = document.querySelector('.btn-kostum-style');
    if (btnRanked) { btnRanked.disabled = false; btnRanked.style.opacity = ''; btnRanked.style.cursor = ''; btnRanked.title = ''; }
    if (btnKostum) { btnKostum.disabled = false; btnKostum.style.opacity = ''; btnKostum.style.cursor = ''; btnKostum.title = ''; }
}
</script>
