export interface WaitlistEntry {
  email: string;
  createdAt: string;
}

export interface WaitlistStore {
  addEmail(email: string): Promise<WaitlistEntry>;
}

class InMemoryWaitlistStore implements WaitlistStore {
  private emails = new Set<string>();

  async addEmail(email: string): Promise<WaitlistEntry> {
    this.emails.add(email);
    return {
      email,
      createdAt: new Date().toISOString(),
    };
  }
}

export const waitlistStore: WaitlistStore = new InMemoryWaitlistStore();
