const { TestEnvironment } = require("jest-environment-node");

class DatabaseEnvironment extends TestEnvironment {
  async teardown() {
    await this.global.closeTestDatabase?.();
    await super.teardown();
  }
}

module.exports = DatabaseEnvironment;