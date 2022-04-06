import axios from "axios";
import execute from "../../lib/ortto";

export default async function handler(req, res) {
  const { body } = req;

  console.log(body);

  if (req.method != "POST") {
    res
      .status(400)
      .json({ error: { code: 400, message: "Method Not Allowed" } });
    return;
  }

  try {
    const scope = body.scope.split("/");

    if (scope[1] !== "cart") {
      res.status(400).json({ error: "Wrong entity" });
      return;
    }

    if (scope[2] !== "created" && scope[2] !== "updated") {
      res.status(400).json({ error: "Wrong entity" });
      return;
    }

    const cart_id = body.data.id;

    const { data: cart } = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.NEXT_PUBLIC_BC_STORE_ID}/v3/carts/${order_id}?include=line_items.physical_items.options`,
      {
        headers: {
          Accept: "application/json",
          "X-Auth-Token": process.env.NEXT_PUBLIC_BC_AUTH_TOKEN,
        },
      }
    );

    const line_items = cart.line_items.physical_items.map((line_item) => {
      return {
        product_id: line_item.product_id,
        variant_id: line_item.variant_id,
        quantity: line_item.quantity,
        subtotal_price: line_item,
        name:
          line_item.name +
          " - " +
          line_items.name
            .map((option) => {
              return `${option.name} : ${option.value}`;
            })
            .split(", "),
      };
    });

    const events = [
      {
        resource: "cart",
        event: `${scope[2]}`,
        data_source_id: process.env.NEXT_PUBLIC_AP_DATA_SOURCE_ID,
        customer: {
          id: cart.customer_id.toString(),
          email: cart.email,
        },
        data: {
          id: cart.id,
          currency: cart.currency.code,
          total_price: cart.cart_amount,
          subtotal_price: cart.cart_amount,
          line_items
        },
      },
    ];

    const result = await execute(events);
    console.log(`Cart ${cart_id} ${scope[2]}`);
    res.status(200).json({ message: `Cart ${cart_id} ${scope[2]}` });
  } catch (e) {
    res.status(400).json({ error: e.toString() });
    return;
  }
}
