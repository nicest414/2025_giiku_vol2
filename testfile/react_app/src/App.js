import React, { useEffect, useState } from "react";

function App() {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        chrome.storage.local.get("amazonCartItems", (data) => {
            if (data.amazonCartItems) {
                setCartItems(data.amazonCartItems);
            }
        });
    }, []);

    return (
        <div>
            <h1>Amazon カート情報</h1>
            {cartItems.length > 0 ? (
                <ul>
                    {cartItems.map((item, index) => (
                        <li key={index}>
                            <h3>{item.title}</h3>
                            <p>{item.price}</p>
                            <img src={item.imageUrl} alt={item.title} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>カートが空です。</p>
            )}
        </div>
    );
}

export default App;
