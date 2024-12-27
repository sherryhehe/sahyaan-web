const BASE_URL = "https://v6.exchangerate-api.com/v6";

export default async function convertCurrency(
  amount,
  fromCurrency,
  toCurrency,
) {
  try {
    const response = await fetch(
      `${BASE_URL}/${process.env.NEXT_PUBLIC_CONVERTION_API_KEY}/latest/${fromCurrency}`,
    );
    const data = await response.json();

    if (data.result === "success") {
      const rate = data.conversion_rates[toCurrency];
      if (rate) {
        const convertedAmount = amount * rate;
        return convertedAmount.toFixed(2);
      } else {
        throw new Error(`Exchange rate not available for ${toCurrency}`);
      }
    } else {
      throw new Error(data["error-type"]);
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}
