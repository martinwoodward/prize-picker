/* eslint-disable no-plusplus */
import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';

// GitHub API interface
interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string; // eslint-disable-line camelcase
  bio: string | null;
  public_repos: number; // eslint-disable-line camelcase
  followers: number;
  following: number;
}

// Converted GitHub profile interface
interface GitHubProfile {
  avatarUrl: string;
  name: string | null;
  login: string;
}

// Initialize slot machine
(() => {
  const drawButton = document.getElementById('draw-button') as HTMLButtonElement | null;
  const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
  const settingsButton = document.getElementById('settings-button') as HTMLButtonElement | null;
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;

  // Graceful exit if necessary elements are not found
  if (!(
    drawButton
    && fullscreenButton
    && settingsButton
    && settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
  )) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error('Confetti canvas is not an instance of Canvas. This is possibly a bug.');
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 40;
  const CONFETTI_COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
  let confettiAnimationId;

  /** Confetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers confetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  // Cache for GitHub profiles to avoid repeated API calls
  const githubProfileCache = new Map<string, GitHubUser | null>();

  /** Fetch GitHub user profile */
  const fetchGitHubProfile = async (username: string): Promise<GitHubUser | null> => {
    // Check cache first
    if (githubProfileCache.has(username)) {
      return githubProfileCache.get(username) || null;
    }

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const profile = await response.json() as GitHubUser;
      githubProfileCache.set(username, profile);
      return profile;
    } catch (error) {
      console.error('Failed to fetch GitHub profile:', error);
      githubProfileCache.set(username, null);
      return null;
    }
  };

  /** Convert GitHub API response to our profile interface */
  const convertGitHubProfile = (profile: GitHubUser): GitHubProfile => ({
    avatarUrl: profile.avatar_url,
    name: profile.name,
    login: profile.login
  });

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    drawButton.disabled = true;
    settingsButton.disabled = true;
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
  };

  /** Function to preload GitHub profile when winner is determined */
  const onWinnerDetermined = async (
    winner: string
  ): Promise<{ avatarUrl: string; name: string | null; login: string } | null> => {
    // Fetch GitHub profile data and wait for it to complete before continuing
    const profile = await fetchGitHubProfile(winner);
    return profile ? convertGitHubProfile(profile) : null;
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();

    drawButton.disabled = false;
    settingsButton.disabled = false;
  };

  /** Slot instance */
  const slot = new Slot({
    reelContainerSelector: '#reel',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onWinnerDetermined,
    onNameListChanged: stopWinningAnimation
  });

  const getNames = async () => {
    const res = await fetch('names.txt');
    const names = await res.text();
    const arr = names.split('\n');
    for (let i = 0; i < arr.length; i++) {
      const name = arr[i].trim();
      if (name) {
        slot.names.push(name);
      }
    }
  };
  getNames();

  /** To open the setting page */
  const onSettingsOpen = () => {
    nameListTextArea.value = slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };

  // Click handler for "Draw" button
  drawButton.addEventListener('click', () => {
    if (!slot.names.length) {
      onSettingsOpen();
      return;
    }

    slot.spin();
  });

  // Hide fullscreen button when it is not supported
  if (
    typeof document.documentElement.requestFullscreen !== 'function'
    || typeof document.exitFullscreen !== 'function'
  ) {
    fullscreenButton.remove();
  }

  // Click handler for "Fullscreen" button
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  // Click handler for "Settings" button
  settingsButton.addEventListener('click', onSettingsOpen);

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {
    slot.names = nameListTextArea.value
      ? nameListTextArea.value.split(/\n/).filter((name) => Boolean(name.trim()))
      : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);

  // Keyboard handler for any key press to trigger draw
  document.addEventListener('keydown', (event) => {
    // Prevent triggering if settings are open or if typing in a text area/input
    if (settingsWrapper.style.display === 'block'
      || event.target instanceof HTMLTextAreaElement
      || event.target instanceof HTMLInputElement) {
      return;
    }

    // Prevent triggering if draw button is disabled (during spin)
    if (drawButton.disabled) {
      return;
    }

    // Prevent default behavior for certain keys that might have special meaning
    event.preventDefault();

    // Trigger the same functionality as clicking the draw button
    if (!slot.names.length) {
      onSettingsOpen();
      return;
    }

    slot.spin();
  });
})();
