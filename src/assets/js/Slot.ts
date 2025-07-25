interface SlotConfigurations {
  /** User configuration for maximum item inside a reel */
  maxReelItems?: number;
  /** User configuration for whether winner should be removed from name list */
  removeWinner?: boolean;
  /** User configuration for element selector which reel items should append to */
  reelContainerSelector: string;
  /** User configuration for callback function that runs before spinning reel */
  onSpinStart?: () => void;
  /** User configuration for callback function that runs after spinning reel */
  onSpinEnd?: () => void;
  /** User configuration for callback function that runs when winner is determined */
  onWinnerDetermined?: (
    winner: string
  ) => Promise<{ avatarUrl: string; name: string | null; login: string } | null>;

  /** User configuration for callback function that runs after user updates the name list */
  onNameListChanged?: () => void;
}

/** Class for doing random name pick and animation */
export default class Slot {
  /** List of names to draw from */
  private nameList: string[];

  /** Whether there is a previous winner element displayed in reel */
  private havePreviousWinner: boolean;

  /** Container that hold the reel items */
  private reelContainer: HTMLElement | null;

  /** Maximum item inside a reel */
  private maxReelItems: NonNullable<SlotConfigurations['maxReelItems']>;

  /** Whether winner should be removed from name list */
  private shouldRemoveWinner: NonNullable<SlotConfigurations['removeWinner']>;

  /** Reel animation object instance */
  private reelAnimation?: Animation;

  /** Callback function that runs before spinning reel */
  private onSpinStart?: NonNullable<SlotConfigurations['onSpinStart']>;

  /** Callback function that runs after spinning reel */
  private onSpinEnd?: NonNullable<SlotConfigurations['onSpinEnd']>;

  /** Callback function that runs when winner is determined */
  private onWinnerDetermined?: NonNullable<SlotConfigurations['onWinnerDetermined']>;

  /** Callback function that runs after spinning reel */
  private onNameListChanged?: NonNullable<SlotConfigurations['onNameListChanged']>;

  /**
   * Constructor of Slot
   * @param maxReelItems  Maximum item inside a reel
   * @param removeWinner  Whether winner should be removed from name list
   * @param reelContainerSelector  The element ID of reel items to be appended
   * @param onSpinStart  Callback function that runs before spinning reel
   * @param onNameListChanged  Callback function that runs when user updates the name list
   */
  constructor(
    {
      maxReelItems = 30,
      removeWinner = true,
      reelContainerSelector,
      onSpinStart,
      onSpinEnd,
      onWinnerDetermined,
      onNameListChanged
    }: SlotConfigurations
  ) {
    this.nameList = [];
    this.havePreviousWinner = false;
    this.reelContainer = document.querySelector(reelContainerSelector);
    this.maxReelItems = maxReelItems;
    this.shouldRemoveWinner = removeWinner;
    this.onSpinStart = onSpinStart;
    this.onSpinEnd = onSpinEnd;
    this.onWinnerDetermined = onWinnerDetermined;
    this.onNameListChanged = onNameListChanged;

    // Create reel animation
    this.reelAnimation = this.reelContainer?.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(1px)', offset: 0.5 },
        // Here we transform the reel to move up and stop at the top of last item
        // "(Number of item - 1) * height of reel item" of wheel is the amount of pixel to move up
        // 7.5rem * 16 = 120px, which equals to reel item height
        { transform: `translateY(-${(this.maxReelItems - 1) * (7.5 * 16)}px)`, filter: 'blur(0)' }
      ],
      {
        duration: this.maxReelItems * 100, // 100ms for 1 item
        easing: 'ease-in-out',
        iterations: 1
      }
    );

    this.reelAnimation?.cancel();
  }

  /**
   * Setter for name list
   * @param names  List of names to draw a winner from
   */
  set names(names: string[]) {
    this.nameList = names;

    const reelItemsToRemove = this.reelContainer?.children
      ? Array.from(this.reelContainer.children)
      : [];

    reelItemsToRemove
      .forEach((element) => element.remove());

    this.havePreviousWinner = false;

    if (this.onNameListChanged) {
      this.onNameListChanged();
    }
  }

  /** Getter for name list */
  get names(): string[] {
    return this.nameList;
  }

  /**
   * Setter for shouldRemoveWinner
   * @param removeWinner  Whether the winner should be removed from name list
   */
  set shouldRemoveWinnerFromNameList(removeWinner: boolean) {
    this.shouldRemoveWinner = removeWinner;
  }

  /** Getter for shouldRemoveWinner */
  get shouldRemoveWinnerFromNameList(): boolean {
    return this.shouldRemoveWinner;
  }

  /**
   * Returns a new array where the items are shuffled
   * @template T  Type of items inside the array to be shuffled
   * @param array  The array to be shuffled
   * @returns The shuffled array
   */
  private static shuffleNames<T = unknown>(array: T[]): T[] {
    const keys = Object.keys(array) as unknown[] as number[];
    const result: T[] = [];
    for (let k = 0, n = keys.length; k < array.length && n > 0; k += 1) {
      // eslint-disable-next-line no-bitwise
      const i = Math.random() * n | 0;
      const key = keys[i];
      result.push(array[key]);
      n -= 1;
      const tmp = keys[n];
      keys[n] = key;
      keys[i] = tmp;
    }
    return result;
  }

  /**
   * Function for spinning the slot
   * @returns Whether the spin is completed successfully
   */
  public async spin(): Promise<boolean> {
    if (!this.nameList.length) {
      console.error('Name List is empty. Cannot start spinning.');
      return false;
    }

    if (this.onSpinStart) {
      this.onSpinStart();
    }

    const { reelContainer, reelAnimation, shouldRemoveWinner } = this;
    if (!reelContainer || !reelAnimation) {
      return false;
    }

    // Shuffle names and create reel items
    let randomNames = Slot.shuffleNames<string>(this.nameList);

    while (randomNames.length && randomNames.length < this.maxReelItems) {
      randomNames = [...randomNames, ...randomNames];
    }

    randomNames = randomNames.slice(0, this.maxReelItems - Number(this.havePreviousWinner));

    const fragment = document.createDocumentFragment();

    randomNames.forEach((name) => {
      const newReelItem = document.createElement('div');
      newReelItem.innerHTML = `@${name}`;
      newReelItem.classList.add('reel-item');
      fragment.appendChild(newReelItem);
    });

    reelContainer.appendChild(fragment);

    // eslint-disable-next-line no-console
    console.log('Displayed items: ', randomNames);
    // eslint-disable-next-line no-console
    console.log('Winner: ', randomNames[randomNames.length - 1]);

    const winner = randomNames[randomNames.length - 1];

    // Get winner profile data before proceeding
    let winnerProfile: { avatarUrl: string; name: string | null; login: string } | null = null;
    if (this.onWinnerDetermined) {
      winnerProfile = await this.onWinnerDetermined(winner);
    }

    // Remove winner form name list if necessary
    if (shouldRemoveWinner) {
      this.nameList.splice(this.nameList.findIndex(
        (name) => name === winner
      ), 1);
    }

    // eslint-disable-next-line no-console
    console.log('Remaining: ', this.nameList);

    // Play the spin animation
    const animationPromise = new Promise((resolve) => {
      reelAnimation.onfinish = resolve;
    });

    reelAnimation.play();

    await animationPromise;

    // Sets the current playback time to the end of the animation
    // Fix issue for animatin not playing after the initial play on Safari
    reelAnimation.finish();

    Array.from(reelContainer.children)
      .slice(0, reelContainer.children.length - 1)
      .forEach((element) => element.remove());

    // Replace the last element with a proper winner element that includes profile data
    const lastElement = reelContainer.children[reelContainer.children.length - 1];
    if (lastElement) {
      const winnerElement = Slot.createWinnerElement(winner, winnerProfile);
      reelContainer.replaceChild(winnerElement, lastElement);
    }

    this.havePreviousWinner = true;

    if (this.onSpinEnd) {
      this.onSpinEnd();
    }
    return true;
  }

  /**
   * Create a winner display element with GitHub profile layout
   * @param winner The winner's GitHub username
   * @param profile The GitHub profile data (optional, for immediate display)
   * @returns HTMLElement representing the winner
   */
  public static createWinnerElement(
    winner: string,
    profile?: { avatarUrl: string; name: string | null; login: string } | null
  ): HTMLElement {
    const winnerElement = document.createElement('div');
    winnerElement.classList.add('reel-item', 'reel-item--winner');

    if (profile) {
      // Show GitHub profile data
      winnerElement.innerHTML = `
        <div class="winner-profile">
          <img class="winner-profile__avatar" src="${profile.avatarUrl}" alt="${profile.login}'s avatar" />
          <div class="winner-profile__info">
            <div class="winner-profile__name">${profile.name || profile.login}</div>
            <div class="winner-profile__username">@${profile.login}</div>
          </div>
        </div>
      `;
    } else if (profile === null) {
      // Profile fetch failed or not found - show just the username without profile data
      winnerElement.innerHTML = `@${winner}`;
    } else {
      // Show loading state (this case should rarely happen now)
      winnerElement.innerHTML = `
        <div class="winner-profile">
          <div class="winner-profile__loading">
            <div class="winner-profile__name">@${winner}</div>
          </div>
        </div>
      `;
    }

    return winnerElement;
  }

  /**
   * Update the winner element with GitHub profile data
   * @param profile The GitHub profile data
   */
  public updateWinnerWithProfile(
    profile: { avatarUrl: string; name: string | null; login: string } | null
  ): void {
    if (!this.reelContainer) return;

    const winnerElement = this.reelContainer.querySelector('.reel-item--winner');
    if (!winnerElement) return;

    if (profile) {
      winnerElement.innerHTML = `
        <div class="winner-profile">
          <img class="winner-profile__avatar" src="${profile.avatarUrl}" alt="${profile.login}'s avatar" />
          <div class="winner-profile__info">
            <div class="winner-profile__name">${profile.name || profile.login}</div>
            <div class="winner-profile__username">@${profile.login}</div>
          </div>
        </div>
      `;
    } else {
      // Profile not found - show just the username without profile data
      const currentWinner = winnerElement.querySelector('.winner-profile__name')?.textContent?.replace('@', '') || '';
      winnerElement.innerHTML = `@${currentWinner}`;
    }
  }
}
