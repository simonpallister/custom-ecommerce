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
    if (scope[1] !== "customer") {
      res.status(400).json({ error: "Wrong entity" });
      return;
    }
    const order_id = body.data.id;

    const { data: customer } = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/customers/${order_id}`,
      {
        headers: {
          Accept: "application/json",
          "X-Auth-Token": process.env.BC_AUTH_TOKEN,
        },
      }
    );

    const events = [
      {
        resource: "customer",
        event: scope[2],
        data_source_id: process.env.AP_DATA_SOURCE_ID,
        data: {
          id: customer.id.toString(),
          email: customer.email,
          email_marketing:
            customer.accepts_product_review_abandoned_cart_emails,
          phone: customer.phone,
          first_name: customer.first_name,
          last_name: customer.last_name,
          billing: {},
          created_at: customer.date_created,
          updated_at: customer.date_modified,
        },
      },
    ];

    const result = await execute(events);
    console.log(`Customer ${customer_id} ${scope[2]}`);
    res.status(200).json({ message: `Customer ${customer_id} ${scope[2]}` });
  } catch (e) {
    console.log(e)
    res.status(200).json({ error: e.toString() });
    return;
  }
}
