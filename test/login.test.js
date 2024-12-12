// login.test.js

const bcrypt = require("bcrypt");
const passport = require("passport");
const { getLoginPage, postLogin } = require("../controllers/authController");
const Customer = require("../models/customerModel");
const Banner = require("../models/bannerModel");
const Category = require("../models/categoryModel");

// Mock all required modules
jest.mock("../models/customerModel");
jest.mock("../models/bannerModel");
jest.mock("../models/categoryModel");
jest.mock("bcrypt");
jest.mock("passport");

describe("Login Functionality Tests", () => {
  let req, res, next;

  // Setup before each test
  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "testPassword123",
      },
      isAuthenticated: jest.fn(() => false),
      user: null,
      logIn: jest.fn(),
      session: {},
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Page Loading", () => {
    test("should successfully load login page with all required data", async () => {
      const mockBanner = { id: 1, imageUrl: "test-banner.jpg" };
      const mockCategories = [
        { id: 1, name: "Category 1" },
        { id: 2, name: "Category 2" },
      ];

      Banner.getFirstBanner.mockImplementation((callback) =>
        callback(null, mockBanner)
      );
      Category.getAllCategories.mockImplementation((callback) =>
        callback(null, mockCategories)
      );

      await getLoginPage(req, res);

      expect(res.render).toHaveBeenCalledWith("account/login", {
        userAuthenticated: false,
        user: null,
        topBanner: mockBanner,
        categories: mockCategories,
        errorMessage: null,
      });
    });

    test("should handle banner retrieval error", async () => {
      Banner.getFirstBanner.mockImplementation((callback) =>
        callback(new Error("Failed to fetch banner"))
      );

      await getLoginPage(req, res);

      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });

    test("should handle categories retrieval error", async () => {
      Banner.getFirstBanner.mockImplementation((callback) =>
        callback(null, {})
      );
      Category.getAllCategories.mockImplementation((callback) =>
        callback(new Error("Failed to fetch categories"))
      );

      await getLoginPage(req, res);

      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("Login Authentication", () => {
    test("should successfully login admin user", async () => {
      const adminUser = {
        id: 1,
        email: "admin@example.com",
        role: "admin",
      };

      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, adminUser, null);
        };
      });

      req.logIn.mockImplementation((user, callback) => callback(null));

      await postLogin(req, res, next);

      expect(req.session.userId).toBe(adminUser.id);
      expect(res.redirect).toHaveBeenCalledWith("/categories");
    });

    test("should successfully login customer user", async () => {
      const customerUser = {
        id: 2,
        email: "customer@example.com",
        role: "customer",
      };

      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, customerUser, null);
        };
      });

      req.logIn.mockImplementation((user, callback) => callback(null));

      await postLogin(req, res, next);

      expect(req.session.userId).toBe(customerUser.id);
      expect(res.redirect).toHaveBeenCalledWith("/cart");
    });

    test("should handle invalid credentials", async () => {
      const mockBanner = { id: 1, imageUrl: "test-banner.jpg" };
      const mockCategories = [{ id: 1, name: "Category 1" }];

      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, false, { message: "Invalid credentials" });
        };
      });

      Banner.getFirstBanner.mockImplementation((callback) =>
        callback(null, mockBanner)
      );
      Category.getAllCategories.mockImplementation((callback) =>
        callback(null, mockCategories)
      );

      await postLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith("account/login", {
        userAuthenticated: false,
        user: null,
        topBanner: mockBanner,
        categories: mockCategories,
        errorMessage: "Invalid email or password. Please try again.",
      });
    });

    test("should handle authentication error", async () => {
      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(new Error("Authentication failed"));
        };
      });

      await postLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test("should handle login session error", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "customer",
      };

      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, user, null);
        };
      });

      req.logIn.mockImplementation((user, callback) =>
        callback(new Error("Session error"))
      );

      await postLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test("should handle missing user data", async () => {
      const mockBanner = { id: 1, imageUrl: "test-banner.jpg" };
      const mockCategories = [{ id: 1, name: "Category 1" }];

      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, null, { message: "User not found" });
        };
      });

      Banner.getFirstBanner.mockImplementation((callback) =>
        callback(null, mockBanner)
      );
      Category.getAllCategories.mockImplementation((callback) =>
        callback(null, mockCategories)
      );

      await postLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith(
        "account/login",
        expect.objectContaining({
          errorMessage: "Invalid email or password. Please try again.",
        })
      );
    });
  });
});
