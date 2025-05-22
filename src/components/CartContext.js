import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [shouldFetchCart, setShouldFetchCart] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!shouldFetchCart) {
      console.log('Skipping cart fetch due to shouldFetchCart flag');
      return;
    }

    if (cart.length > 0) {
      console.log('Cart already has items, skipping initial fetch:', cart);
      return;
    }

    const fetchCart = async () => {
      if (!user) {
        console.log('No user logged in, skipping cart fetch');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching cart with token:', token);
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log('Cart fetched successfully on mount:', JSON.stringify(data, null, 2));
          const normalizedItems = (data.items || []).map((item) => {
            if (!item.productId) {
              console.error('Product data missing for cart item:', item);
              return null;
            }
            return {
              _id: item.productId._id,
              name: item.productId.name,
              description: item.productId.description,
              price: item.productId.price,
              images: item.productId.images || [],
              brand: item.productId.brand,
              gender: item.productId.gender,
              size: item.productId.size,
              notes: item.productId.notes,
              longevity: item.productId.longevity,
              rating: item.productId.rating,
              averageRating: item.productId.averageRating,
              reviews: item.productId.reviews,
              quantity: item.quantity,
            };
          }).filter(item => item !== null);
          setCart(normalizedItems);
          console.log('Cart state after initial fetch:', JSON.stringify(normalizedItems, null, 2));
        } else {
          console.error('Failed to fetch cart:', data);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchCart]);

  const addToCart = async (product) => {
    console.log('addToCart called with product:', product);
    if (!product || !product._id) {
      console.error('Invalid product passed to addToCart:', product);
      return;
    }

    setCart((prevCart) => {
      console.log('Current cart state before update:', prevCart);
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        console.log('Item already in cart, increasing quantity:', existingItem);
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      console.log('Adding new item to cart:', { ...product, quantity: 1 });
      return [...prevCart, { ...product, quantity: 1 }];
    });

    if (user) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }
        console.log('Making API call to add to cart with token:', token);
        console.log('API request body:', JSON.stringify({ productId: product._id, quantity: 1 }));
        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API call failed with status:', response.status, 'Error:', errorData);
          setCart((prevCart) => {
            console.log('Reverting cart state due to API failure:', prevCart);
            return prevCart;
          });
          return;
        }
        const data = await response.json();
        console.log('API response status:', response.status);
        console.log('Successfully added to cart:', data);
        const normalizedItems = (data.items || []).map((item) => {
          if (!item.productId) {
            console.error('Product data missing for cart item:', item);
            return null;
          }
          return {
            _id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            images: item.productId.images || [],
            brand: item.productId.brand,
            gender: item.productId.gender,
            size: item.productId.size,
            notes: item.productId.notes,
            longevity: item.productId.longevity,
            rating: item.productId.rating,
            averageRating: item.productId.averageRating,
            reviews: item.productId.reviews,
            quantity: item.quantity,
          };
        }).filter(item => item !== null);
        setCart([...normalizedItems]);
        console.log('Cart state after API sync:', JSON.stringify(normalizedItems, null, 2));
      } catch (err) {
        console.error('Network error adding to cart:', err.message);
        setCart((prevCart) => {
          console.log('Reverting cart state due to network error:', prevCart);
          return prevCart;
        });
      }
    } else {
      console.log('User not logged in; cart updated locally');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update cart quantity:', errorData);
        } else {
          const data = await response.json();
          const normalizedItems = (data.items || []).map((item) => {
            if (!item.productId) {
              console.error('Product data missing for cart item:', item);
              return null;
            }
            return {
              _id: item.productId._id,
              name: item.productId.name,
              description: item.productId.description,
              price: item.productId.price,
              images: item.productId.images || [],
              brand: item.productId.brand,
              gender: item.productId.gender,
              size: item.productId.size,
              notes: item.productId.notes,
              longevity: item.productId.longevity,
              rating: item.productId.rating,
              averageRating: item.productId.averageRating,
              reviews: item.productId.reviews,
              quantity: item.quantity,
            };
          }).filter(item => item !== null);
          setCart([...normalizedItems]);
          console.log('Cart state after quantity update:', JSON.stringify(normalizedItems, null, 2));
        }
      } catch (err) {
        console.error('Error updating cart quantity:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));

    if (user) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/remove', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to remove from cart:', errorData);
        } else {
          const data = await response.json();
          const normalizedItems = (data.items || []).map((item) => {
            if (!item.productId) {
              console.error('Product data missing for cart item:', item);
              return null;
            }
            return {
              _id: item.productId._id,
              name: item.productId.name,
              description: item.productId.description,
              price: item.productId.price,
              images: item.productId.images || [],
              brand: item.productId.brand,
              gender: item.productId.gender,
              size: item.productId.size,
              notes: item.productId.notes,
              longevity: item.productId.longevity,
              rating: item.productId.rating,
              averageRating: item.productId.averageRating,
              reviews: item.productId.reviews,
              quantity: item.quantity,
            };
          }).filter(item => item !== null);
          setCart([...normalizedItems]);
          console.log('Cart state after removal:', JSON.stringify(normalizedItems, null, 2));
        }
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  };

  const clearCart = async () => {
    console.log('Clearing cart...');
    setCart([]);
    setShouldFetchCart(false);

    if (user) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found for clearing cart');
          return;
        }
        const response = await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to clear cart on backend:', errorData);
          return;
        }
        console.log('Cart cleared successfully on backend');
      } catch (err) {
        console.error('Error clearing cart on backend:', err);
      }
    } else {
      console.log('User not logged in; cart cleared locally');
    }
  };

  console.log('CartContext providing cart:', JSON.stringify(cart, null, 2));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotal,
        clearCart,
        setShouldFetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);