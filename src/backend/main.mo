import Array "mo:core/Array";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";

actor {

  public type Customer = {
    id : Nat;
    customerName : Text;
    companyName : Text;
    phone : Text;
    email : Text;
    address : Text;
    gstNumber : Text;
    phoneVerified : Bool;
    createdAt : Int;
  };

  public type Product = {
    productId : Nat;
    name : Text;
    category : Text;
    price : Float;
    stockQuantity : Nat;
  };

  public type OrderItem = {
    id : Nat;
    orderId : Nat;
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Float;
  };

  public type Order = {
    orderId : Nat;
    customerId : Nat;
    customerName : Text;
    companyName : Text;
    orderDate : Int;
    totalAmount : Float;
    status : Text;
    items : [OrderItem];
  };

  public type CreateOrderItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type DashboardStats = {
    totalCustomers : Nat;
    totalOrders : Nat;
    totalRevenue : Float;
    lowStockProducts : Nat;
    recentOrders : [Order];
  };

  var customers : [Customer] = [];
  var products : [Product] = [];
  var orders : [Order] = [];
  var nextCustomerId : Nat = 1;
  var nextProductId : Nat = 1;
  var nextOrderId : Nat = 1;
  var nextItemId : Nat = 1;
  var seeded : Bool = false;

  func textContains(haystack : Text, needle : Text) : Bool {
    if (needle == "") return true;
    let h = haystack.toLower();
    let n = needle.toLower();
    let hArr = h.toArray();
    let nArr = n.toArray();
    let hLen = hArr.size();
    let nLen = nArr.size();
    if (nLen > hLen) return false;
    var i = 0;
    label outer while (i + nLen <= hLen) {
      var match_ = true;
      var j = 0;
      while (j < nLen) {
        if (hArr[i + j] != nArr[j]) {
          match_ := false;
        };
        j += 1;
      };
      if (match_) return true;
      i += 1;
    };
    return false;
  };

  func findCustomer(id : Nat) : ?Customer {
    for (c in customers.vals()) {
      if (c.id == id) return ?c;
    };
    return null;
  };

  func findProduct(pid : Nat) : ?Product {
    for (p in products.vals()) {
      if (p.productId == pid) return ?p;
    };
    return null;
  };

  func natToFloat(n : Nat) : Float {
    n.toFloat()
  };

  // ── Customers ──

  public query func getCustomers(search : Text) : async [Customer] {
    if (search == "") return customers;
    return customers.filter(func(c : Customer) : Bool {
      textContains(c.customerName, search) or
      textContains(c.companyName, search) or
      textContains(c.phone, search)
    });
  };

  public query func searchCustomers(query_ : Text) : async [Customer] {
    if (query_ == "") return [];
    let res = customers.filter(func(c : Customer) : Bool {
      textContains(c.customerName, query_) or textContains(c.companyName, query_)
    });
    let sz = res.size();
    if (sz > 10) {
      return res.sliceToArray(0, 10);
    } else {
      return res;
    };
  };

  public func addCustomer(
    customerName : Text, companyName : Text, phone : Text,
    email : Text, address : Text, gstNumber : Text
  ) : async { ok : Bool; message : Text; customer : ?Customer } {
    for (c in customers.vals()) {
      if (c.phone == phone and phone != "") {
        return { ok = false; message = "Phone already exists"; customer = null };
      };
    };
    let newC : Customer = {
      id = nextCustomerId;
      customerName = customerName;
      companyName = companyName;
      phone = phone;
      email = email;
      address = address;
      gstNumber = gstNumber;
      phoneVerified = true;
      createdAt = Time.now();
    };
    nextCustomerId += 1;
    customers := customers.concat([newC]);
    return { ok = true; message = "Customer added"; customer = ?newC };
  };

  public func updateCustomer(
    id : Nat, customerName : Text, companyName : Text, phone : Text,
    email : Text, address : Text, gstNumber : Text
  ) : async { ok : Bool; message : Text } {
    var found = false;
    customers := customers.map(func(c : Customer) : Customer {
      if (c.id == id) {
        found := true;
        let updated : Customer = {
          id = c.id;
          customerName = customerName;
          companyName = companyName;
          phone = phone;
          email = email;
          address = address;
          gstNumber = gstNumber;
          phoneVerified = c.phoneVerified;
          createdAt = c.createdAt;
        };
        return updated;
      };
      return c;
    });
    if (found) {
      return { ok = true; message = "Updated" };
    } else {
      return { ok = false; message = "Not found" };
    };
  };

  public func deleteCustomer(id : Nat) : async { ok : Bool; message : Text } {
    let before = customers.size();
    customers := customers.filter(func(c : Customer) : Bool { c.id != id });
    if (customers.size() < before) {
      return { ok = true; message = "Deleted" };
    } else {
      return { ok = false; message = "Not found" };
    };
  };

  // ── Products ──

  public query func getProducts() : async [Product] {
    return products;
  };

  public func addProduct(name : Text, category : Text, price : Float, stockQuantity : Nat)
    : async { ok : Bool; message : Text; product : ?Product } {
    let p : Product = {
      productId = nextProductId;
      name = name;
      category = category;
      price = price;
      stockQuantity = stockQuantity;
    };
    nextProductId += 1;
    products := products.concat([p]);
    return { ok = true; message = "Product added"; product = ?p };
  };

  public func updateProduct(productId : Nat, name : Text, category : Text, price : Float, stockQuantity : Nat)
    : async { ok : Bool; message : Text } {
    var found = false;
    products := products.map(func(p : Product) : Product {
      if (p.productId == productId) {
        found := true;
        let updated : Product = {
          productId = productId;
          name = name;
          category = category;
          price = price;
          stockQuantity = stockQuantity;
        };
        return updated;
      };
      return p;
    });
    if (found) {
      return { ok = true; message = "Updated" };
    } else {
      return { ok = false; message = "Not found" };
    };
  };

  public func deleteProduct(productId : Nat) : async { ok : Bool; message : Text } {
    let before = products.size();
    products := products.filter(func(p : Product) : Bool { p.productId != productId });
    if (products.size() < before) {
      return { ok = true; message = "Deleted" };
    } else {
      return { ok = false; message = "Not found" };
    };
  };

  // ── Orders ──

  public query func getOrders() : async [Order] {
    return orders.reverse();
  };

  public func createOrder(customerId : Nat, items : [CreateOrderItem])
    : async { ok : Bool; message : Text; orderId : ?Nat } {
    switch (findCustomer(customerId)) {
      case null {
        return { ok = false; message = "Customer not found"; orderId = null };
      };
      case (?cust) {
        for (item in items.vals()) {
          switch (findProduct(item.productId)) {
            case null {
              return { ok = false; message = "Product not found"; orderId = null };
            };
            case (?p) {
              if (p.stockQuantity < item.quantity) {
                return { ok = false; message = "Insufficient stock for " # p.name; orderId = null };
              };
            };
          };
        };
        var total : Float = 0.0;
        var ois : [OrderItem] = [];
        let oid = nextOrderId;
        for (item in items.vals()) {
          switch (findProduct(item.productId)) {
            case null {};
            case (?p) {
              total += p.price * natToFloat(item.quantity);
              let oi : OrderItem = {
                id = nextItemId;
                orderId = oid;
                productId = p.productId;
                productName = p.name;
                quantity = item.quantity;
                price = p.price;
              };
              nextItemId += 1;
              ois := ois.concat([oi]);
              products := products.map(func(pr : Product) : Product {
                if (pr.productId == p.productId) {
                  let updated : Product = {
                    productId = pr.productId;
                    name = pr.name;
                    category = pr.category;
                    price = pr.price;
                    stockQuantity = pr.stockQuantity - item.quantity;
                  };
                  return updated;
                };
                return pr;
              });
            };
          };
        };
        let newOrder : Order = {
          orderId = oid;
          customerId = customerId;
          customerName = cust.customerName;
          companyName = cust.companyName;
          orderDate = Time.now();
          totalAmount = total;
          status = "Pending";
          items = ois;
        };
        nextOrderId += 1;
        orders := orders.concat([newOrder]);
        return { ok = true; message = "Order created"; orderId = ?oid };
      };
    };
  };

  public func updateOrderStatus(orderId : Nat, status : Text) : async { ok : Bool; message : Text } {
    var found = false;
    orders := orders.map(func(o : Order) : Order {
      if (o.orderId == orderId) {
        found := true;
        let updated : Order = {
          orderId = o.orderId;
          customerId = o.customerId;
          customerName = o.customerName;
          companyName = o.companyName;
          orderDate = o.orderDate;
          totalAmount = o.totalAmount;
          status = status;
          items = o.items;
        };
        return updated;
      };
      return o;
    });
    if (found) {
      return { ok = true; message = "Updated" };
    } else {
      return { ok = false; message = "Not found" };
    };
  };

  public query func getInvoice(orderId : Nat) : async ?Order {
    for (o in orders.vals()) {
      if (o.orderId == orderId) return ?o;
    };
    return null;
  };

  // ── Dashboard ──

  public query func getDashboardStats() : async DashboardStats {
    var rev : Float = 0.0;
    for (o in orders.vals()) { rev += o.totalAmount };
    let lowStock = products.filter(func(p : Product) : Bool { p.stockQuantity < 500 }).size();
    let total = orders.size();
    let start : Int = if (total > 10) total - 10 else 0;
    let recent = orders.sliceToArray(start, total);
    return {
      totalCustomers = customers.size();
      totalOrders = total;
      totalRevenue = rev;
      lowStockProducts = lowStock;
      recentOrders = recent.reverse();
    };
  };

  // ── Seed ──

  public func seedDemoData() : async () {
    if (seeded) return;
    seeded := true;

    let pd : [(Text, Text, Float, Nat)] = [
      ("250ml PET Bottle","PET Bottles",2.5,5000),
      ("500ml PET Bottle","PET Bottles",4.0,4500),
      ("1L PET Bottle","PET Bottles",6.5,3000),
      ("2L PET Bottle","PET Bottles",9.0,2500),
      ("5L Water Jar","Water Bottles",18.0,1500),
      ("Oil Bottle 1L","Oil Bottles",8.5,2000),
      ("Oil Bottle 5L","Oil Bottles",22.0,1200),
      ("Pharma Bottle 100ml","Pharma Bottles",3.5,3500),
      ("Pharma Bottle 200ml","Pharma Bottles",5.5,3000),
      ("Cosmetic Spray Bottle","Cosmetic Bottles",12.0,1800),
      ("Wide Mouth Jar 500g","Plastic Containers",7.5,2200),
      ("Wide Mouth Jar 1kg","Plastic Containers",11.0,1800),
      ("Juice Bottle 300ml","PET Bottles",5.0,2800),
      ("Transparent PET Container","Plastic Containers",9.5,2000),
      ("Custom PET Bottle","Custom Packaging",15.0,1000),
    ];
    for ((n, cat, pr, st) in pd.vals()) {
      let p : Product = {
        productId = nextProductId;
        name = n;
        category = cat;
        price = pr;
        stockQuantity = st;
      };
      products := products.concat([p]);
      nextProductId += 1;
    };

    let cd : [(Text,Text,Text,Text,Text,Text)] = [
      ("Rajesh Kumar","Kumar Packaging Ltd","9876543210","rajesh@kumar.com","Mumbai MH","GST001"),
      ("Priya Sharma","Sharma Bottles Pvt Ltd","9876543211","priya@sharma.com","Delhi DL","GST002"),
      ("Amit Patel","Patel Plastics","9876543212","amit@patel.com","Ahmedabad GJ","GST003"),
      ("Sunita Verma","Verma Traders","9876543213","sunita@verma.com","Pune MH","GST004"),
      ("Vikram Singh","Singh Enterprises","9876543214","vikram@singh.com","Jaipur RJ","GST005"),
      ("Kavita Reddy","Reddy Packaging","9876543215","kavita@reddy.com","Hyderabad TS","GST006"),
      ("Mohan Das","Das Industries","9876543216","mohan@das.com","Chennai TN","GST007"),
      ("Anita Joshi","Joshi Plastics Co","9876543217","anita@joshi.com","Bengaluru KA","GST008"),
      ("Suresh Nair","Nair Brothers","9876543218","suresh@nair.com","Kochi KL","GST009"),
      ("Deepika Gupta","Gupta Wholesale","9876543219","deepika@gupta.com","Lucknow UP","GST010"),
      ("Ravi Mehta","Mehta Plastic Works","9876543220","ravi@mehta.com","Surat GJ","GST011"),
      ("Pooja Chauhan","Chauhan Containers","9876543221","pooja@chauhan.com","Vadodara GJ","GST012"),
      ("Sandeep Yadav","Yadav Packaging","9876543222","sandeep@yadav.com","Patna BR","GST013"),
      ("Meena Tiwari","Tiwari Plastic Mart","9876543223","meena@tiwari.com","Bhopal MP","GST014"),
      ("Arun Kumar","Kumar Plastic Hub","9876543224","arun@kumar2.com","Indore MP","GST015"),
      ("Geeta Pandey","Pandey Bottles","9876543225","geeta@pandey.com","Varanasi UP","GST016"),
      ("Rohit Shah","Shah Packaging Solutions","9876543226","rohit@shah.com","Rajkot GJ","GST017"),
      ("Shruti Mishra","Mishra Plastic Depot","9876543227","shruti@mishra.com","Nagpur MH","GST018"),
      ("Vijay Thakur","Thakur Industries","9876543228","vijay@thakur.com","Chandigarh CH","GST019"),
      ("Nisha Agarwal","Agarwal Plastics Pvt","9876543229","nisha@agarwal.com","Agra UP","GST020"),
    ];
    for ((cn, co, ph, em, ad, gs) in cd.vals()) {
      let c : Customer = {
        id = nextCustomerId;
        customerName = cn;
        companyName = co;
        phone = ph;
        email = em;
        address = ad;
        gstNumber = gs;
        phoneVerified = true;
        createdAt = Time.now();
      };
      customers := customers.concat([c]);
      nextCustomerId += 1;
    };

    let statuses : [Text] = ["Pending","Confirmed","Shipped","Delivered","Pending"];
    var oi = 0;
    let numProds = products.size();
    while (oi < 5) {
      let cust = customers[oi];
      let p1 = products[oi * 2 % numProds];
      let p2 = products[(oi * 2 + 1) % numProds];
      let q1 : Nat = 20 + oi * 5;
      let q2 : Nat = 10 + oi * 3;
      let tot = p1.price * natToFloat(q1) + p2.price * natToFloat(q2);
      let item1 : OrderItem = {
        id = nextItemId;
        orderId = nextOrderId;
        productId = p1.productId;
        productName = p1.name;
        quantity = q1;
        price = p1.price;
      };
      nextItemId += 1;
      let item2 : OrderItem = {
        id = nextItemId;
        orderId = nextOrderId;
        productId = p2.productId;
        productName = p2.name;
        quantity = q2;
        price = p2.price;
      };
      nextItemId += 1;
      let ord : Order = {
        orderId = nextOrderId;
        customerId = cust.id;
        customerName = cust.customerName;
        companyName = cust.companyName;
        orderDate = Time.now();
        totalAmount = tot;
        status = statuses[oi];
        items = [item1, item2];
      };
      orders := orders.concat([ord]);
      nextOrderId += 1;
      oi += 1;
    };
  };

}
