import syncCategories from "../../lib/category";
import syncCustomers from "../../lib/customer";
import syncOrders from "../../lib/orders";
import syncProducts from "../../lib/products";
import createWebhooks from "../../lib/webhooks";

export default async function handler(req, res) {

  const {entity} = req.query

  console.log(entity)

  res.status(200).json({ message: "Syncing started" });

  if (!entity){
    console.log("Syncing all....");
    Promise.all([
      syncCategories(),
      syncCustomers(),
      syncOrders(),
      syncProducts(),
      createWebhooks(),
    ]).then(console.log("Sync Complete"));
    return
  }

  switch (entity) {
    case "category" :
      console.log("Syncing categories....");
      syncCategories()
      break
    case "customer" :
      console.log("Syncing customers....");
      syncCustomers()
      break
    case "order" :
      console.log("Syncing orders....");
      syncOrders()
      break
    case "product" :
      console.log("Syncing products....");
      syncProducts()
      break
    case "webhooks" :
      console.log("Creating webhooks....");
      createWebhooks()
      break
    }
    console.log("complete")

}
