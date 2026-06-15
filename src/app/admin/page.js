'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  ChevronLeft,
  Database,
  Settings,
  ShoppingBag,
  Users,
  Compass,
  MapPin,
  ExternalLink,
  Check,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Camera
} from 'lucide-react';
import { dbService } from '../../services/db';
import { productsService } from '../../services/products';
import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import ParticleField from '../../components/ParticleField';
import GlassCard from '../../components/GlassCard';
import styles from './page.module.css';

function AdminDashboardContent() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'orders', or 'catalog'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Catalog state extensions
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [drafts, setDrafts] = useState({}); // { [id]: { name, image, price, stock, availability } }
  const [bulkPercent, setBulkPercent] = useState('');
  const [priceLogs, setPriceLogs] = useState([]);
  const [savingProducts, setSavingProducts] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    id: '',
    name: '',
    category: 'Chicken',
    price: '',
    stock: 50,
    image: '',
    description: '',
    weightVariants: '250g, 500g, 750g, 1kg, 2kg'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session');
      if (session !== 'true') {
        router.push('/admin-login');
      } else {
        setIsAdmin(true);
      }
      setCheckingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session');
      router.push('/admin-login');
    }
  };

  useEffect(() => {
    if (!isAdmin || activeView !== 'orders') return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const data = await dbService.fetchAllOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load admin orders:', err);
        setOrdersError('Failed to load system orders. Please verify database connection.');
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [isAdmin, activeView]);

  const handleUpdateStatus = async (orderId, newStatus, paymentMethod) => {
    console.log(`[Admin.handleUpdateStatus] Action: Updating orderId: ${orderId} to status: ${newStatus}`);
    setUpdatingOrderId(orderId);
    try {
      const updated = await dbService.updateOrderStatus(orderId, newStatus, paymentMethod);
      console.log(`[Admin.handleUpdateStatus] Database returned updated record:`, updated);
      
      if (!updated) {
        console.warn(`[Admin.handleUpdateStatus] Row-Level Security or filtering prevented database update.`);
        alert('Failed to update status: Database returned 0 updated rows. This usually means row-level security (RLS) policies block updates on the orders table for your database connection.');
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Load products & audit logs when catalog editor is active
  useEffect(() => {
    if (!isAdmin || activeView !== 'catalog') return;

    const loadCatalogData = async () => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const data = await productsService.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setProductsError('Failed to load products from database.');
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadPriceLogs = () => {
      if (typeof window !== 'undefined') {
        const storedLogs = localStorage.getItem('admin_price_logs');
        if (storedLogs) {
          try {
            setPriceLogs(JSON.parse(storedLogs));
          } catch (e) {
            console.error('Failed to parse price logs:', e);
            setPriceLogs([]);
          }
        }
      }
    };

    loadCatalogData();
    loadPriceLogs();
  }, [isAdmin, activeView]);

  const handleFieldChange = (productId, field, value) => {
    setDrafts(prev => {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return prev;
      
      const currentDraft = prev[productId] || {
        name: currentProduct.name,
        image: currentProduct.image,
        price: currentProduct.price,
        stock: currentProduct.stock,
        availability: currentProduct.availability || 'In Stock'
      };

      return {
        ...prev,
        [productId]: {
          ...currentDraft,
          [field]: value
        }
      };
    });
  };

  const triggerImageUpload = (productId) => {
    const input = document.getElementById(`image-upload-${productId}`);
    if (input) input.click();
  };

  const handleImageUpload = (productId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      handleFieldChange(productId, 'image', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleBulkAdjustment = (type) => {
    const percent = parseFloat(bulkPercent);
    if (isNaN(percent) || percent <= 0) {
      alert('Please enter a valid positive percentage (e.g. 10 or 5).');
      return;
    }

    const multiplier = type === 'increase' ? (1 + percent / 100) : (1 - percent / 100);

    setDrafts(prev => {
      const newDrafts = { ...prev };
      products.forEach(product => {
        const currentDraft = newDrafts[product.id] || {
          name: product.name,
          image: product.image,
          price: product.price,
          stock: product.stock,
          availability: product.availability || 'In Stock'
        };

        const newPrice = Math.round(currentDraft.price * multiplier);
        newDrafts[product.id] = {
          ...currentDraft,
          price: newPrice
        };
      });
      return newDrafts;
    });

    setSuccessMessage(`Bulk adjustment of ${type === 'increase' ? '+' : '-'}${percent}% applied to pricing input fields.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleSaveChanges = async () => {
    const changedProductIds = Object.keys(drafts).filter(id => {
      const original = products.find(p => p.id === id);
      if (!original) return false;
      const draft = drafts[id];
      return (
        draft.name !== original.name ||
        draft.image !== original.image ||
        Number(draft.price) !== Number(original.price) ||
        Number(draft.stock) !== Number(original.stock) ||
        draft.availability !== original.availability
      );
    });

    if (changedProductIds.length === 0) {
      alert('No changes detected to save.');
      return;
    }

    setSavingProducts(true);
    try {
      const username = 'hussainumair';
      const now = new Date().toISOString();
      const newLogs = [];

      for (const id of changedProductIds) {
        const original = products.find(p => p.id === id);
        const draft = drafts[id];

        const updateData = {};
        if (draft.name !== undefined && draft.name !== original.name) {
          updateData.name = draft.name;
        }
        if (draft.image !== undefined && draft.image !== original.image) {
          updateData.image = draft.image;
          updateData.heroImage = draft.image;
        }
        if (draft.price !== undefined && Number(draft.price) !== Number(original.price)) {
          updateData.price = Number(draft.price);
        }
        if (draft.stock !== undefined && Number(draft.stock) !== Number(original.stock)) {
          updateData.stock = Number(draft.stock);
        }
        if (draft.availability !== undefined && draft.availability !== original.availability) {
          updateData.availability = draft.availability;
        }

        await productsService.updateProduct(id, updateData);

        if (draft.price !== undefined && Number(original.price) !== Number(draft.price)) {
          newLogs.push({
            id: `${id}-${now}-${Math.random().toString(36).substr(2, 4)}`,
            productId: id,
            productName: draft.name || original.name,
            prevPrice: Number(original.price),
            newPrice: Number(draft.price),
            dateTime: now,
            adminUsername: username
          });
        }
      }

      if (newLogs.length > 0) {
        const existingLogs = JSON.parse(localStorage.getItem('admin_price_logs') || '[]');
        const updatedLogs = [...newLogs, ...existingLogs].slice(0, 100);
        localStorage.setItem('admin_price_logs', JSON.stringify(updatedLogs));
        setPriceLogs(updatedLogs);
      }

      const freshData = await productsService.getAllProducts();
      setProducts(freshData);
      setDrafts({});
      
      setSuccessMessage('Catalog updated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      alert('Catalog updated successfully.');
    } catch (err) {
      console.error('Failed to save changes:', err);
      alert('Failed to save changes to product catalog: ' + err.message);
    } finally {
      setSavingProducts(false);
    }
  };

  const handleCancelChanges = () => {
    setDrafts({});
    setSuccessMessage('Pending changes discarded.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove non-alphanumeric chars (excluding spaces/hyphens)
      .replace(/[\s_-]+/g, '_') // replace spaces/underscores with single underscore
      .replace(/^-+|-+$/g, ''); // trim starting/trailing underscores
  };

  const handleAddFormChange = (field, value) => {
    setNewProductForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate ID if name changes and user has not manually changed ID from default slug
      if (field === 'name') {
        const currentSlug = generateSlug(prev.name);
        if (prev.id === '' || prev.id === currentSlug) {
          updated.id = generateSlug(value);
        }
      }

      // Auto-populate weightVariants based on category
      if (field === 'category') {
        if (value === 'Chicken' || value === 'Mutton' || value === 'Fish') {
          updated.weightVariants = '250g, 500g, 750g, 1kg, 2kg';
        } else if (value === 'Eggs') {
          updated.weightVariants = '6 pieces, 12 pieces, 24 pieces, 30 pieces';
        } else if (value === 'Add-ons') {
          updated.weightVariants = '200ml, 500ml';
        }
      }

      return updated;
    });
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const { id, name, category, price, stock, image, description, weightVariants } = newProductForm;

    if (!id || !name || !price) {
      alert('Product ID, Name, and Price are required fields.');
      return;
    }

    const variantsArray = weightVariants
      ? weightVariants.split(',').map(s => s.trim()).filter(Boolean)
      : ['500g'];

    const newProdData = {
      id,
      name,
      category,
      basePrice: Number(price),
      price: Number(price),
      stock: Number(stock),
      image: image || '/images/placeholder.png',
      heroImage: image || '/images/placeholder.png',
      description: description || 'Premium fresh cut.',
      weightVariants: variantsArray,
      availability: Number(stock) > 0 ? 'In Stock' : 'Out of Stock',
      tags: [category.toLowerCase()],
      origin: 'Local Farmstead',
      freshnessScore: 99,
      processDate: 'Today',
      eta: 'Same-day delivery before 6 PM',
      packaging: 'Airtight Freshness Shield'
    };

    try {
      await productsService.addProduct(newProdData);
      
      const freshData = await productsService.getAllProducts();
      setProducts(freshData);
      
      setShowAddModal(false);
      setNewProductForm({
        id: '',
        name: '',
        category: 'Chicken',
        price: '',
        stock: 50,
        image: '',
        description: '',
        weightVariants: '250g, 500g, 750g, 1kg, 2kg'
      });

      setSuccessMessage(`Product '${name}' added successfully to catalog!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      alert(`Product '${name}' has been added.`);
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to remove '${name}' from the catalog? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDrafts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      alert(`Product '${name}' has been successfully deleted.`);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product: ' + err.message);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>VERIFYING SECURITY CLEARANCE...</p>
      </div>
    );
  }

  // If redirecting or unauthorized, render nothing
  if (!isAdmin) {
    return null;
  }

  if (activeView === 'orders') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.headerRow}>
          <button onClick={() => setActiveView('dashboard')} className={styles.backButton}>
            <ChevronLeft size={14} />
            <span>Dashboard Menu</span>
          </button>
          <h1 className={styles.subTitle}>
            ORDERS<br />
            <span className="text-gold-gradient">MANAGEMENT.</span>
          </h1>

          <button onClick={handleLogout} className={styles.logoutButton} id="admin-logout-btn" style={{ marginLeft: 'auto' }}>
            Logout
          </button>
        </div>

        {loadingOrders ? (
          <div className={styles.panelLoading}>
            <div className={styles.spinner}>
              <div className={styles.doubleSpinner1}></div>
              <div className={styles.doubleSpinner2}></div>
            </div>
            <p className={styles.loadingText} style={{ marginTop: '16px' }}>RETRIEVING ORDER RECORDS...</p>
          </div>
        ) : ordersError ? (
          <div className={styles.errorMessage}>
            <span>{ordersError}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={36} className="text-gold" />
            <p className={styles.emptyText}>No customer orders recorded in system database.</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => {
              const addr = order.address || {};
              const completeAddress = `${addr.address_line_1 || ''}${addr.address_line_2_raw ? ', ' + addr.address_line_2 : ''}, ${addr.city || ''}, ${addr.state || ''} — ${addr.pincode || ''}`;
              
              // Priority 1: coordinates, Priority 2: address fallback
              const mapsUrl = addr.latitude && addr.longitude
                ? `https://maps.google.com/?q=${addr.latitude},${addr.longitude}`
                : `https://maps.google.com/?q=${encodeURIComponent(completeAddress)}`;

              // Safe badge status key
              const badgeKey = (order.status || 'Pending').replace(/\s+/g, '');

              return (
                <GlassCard key={order.id} className={styles.orderCard} hoverGlow={false} expandOnHover={false}>
                  <div className={styles.orderCardHeader}>
                    <div>
                      <span className={styles.orderIdLabel}>Order ID</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px', marginBottom: '4px' }}>
                        <h4 className={styles.orderNumber}>{order.orderNumber}</h4>
                        <span className={`${styles.statusBadge} ${styles['badge' + badgeKey]}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>

                    <div className={styles.orderStatusContainer}>
                      <span className={styles.orderIdLabel}>Processing Status</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value, order.paymentMethod)}
                        disabled={updatingOrderId === order.id}
                        className={styles.statusSelect}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === order.id && <span className={styles.statusUpdating}>Updating...</span>}
                    </div>
                  </div>

                  <div className={styles.orderCardBody}>
                    {/* Left Column: Customer & Delivery details */}
                    <div className={styles.orderDetailCol}>
                      <h5 className={styles.sectionHeading}>Customer Details</h5>
                      <p className={styles.detailText}>
                        <strong>Name:</strong> {addr.full_name || 'Guest User'}<br />
                        <strong>Phone:</strong> {addr.phone || 'N/A'}<br />
                        <strong>Email:</strong> {addr.email || 'N/A'}
                      </p>

                      <h5 className={styles.sectionHeading} style={{ marginTop: '16px' }}>Delivery Address</h5>
                      <p className={styles.detailText} style={{ lineHeight: '1.4' }}>
                        {completeAddress || 'No address provided'}
                      </p>

                      {addr.latitude && addr.longitude ? (
                        <div className={styles.coordsBadge}>
                          <MapPin size={10} />
                          <span>GPS Locked: {addr.latitude.toFixed(6)}, {addr.longitude.toFixed(6)}</span>
                        </div>
                      ) : (
                        <div className={styles.coordsBadgeMissing}>
                          <ShieldAlert size={10} />
                          <span>Address fallback mode (No GPS lock)</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnNavigate}
                          style={{ margin: 0 }}
                        >
                          <Compass size={14} />
                          <span>Navigate (Google Maps)</span>
                          <ExternalLink size={10} style={{ marginLeft: '4px', opacity: 0.7 }} />
                        </a>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Delivered', order.paymentMethod)}
                            className={styles.btnDeliverQuick}
                            disabled={updatingOrderId === order.id}
                            id={`btn-deliver-quick-${order.id}`}
                          >
                            <Check size={14} />
                            <span>Mark as Delivered</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Order items breakdown */}
                    <div className={styles.orderItemsCol}>
                      <h5 className={styles.sectionHeading}>Ordered Products</h5>
                      <div className={styles.itemsList}>
                        {order.items.map((item) => (
                          <div key={item.id} className={styles.itemRow}>
                            <div className={styles.itemNameBlock}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemWeight}>{item.weight} × {item.quantity}</span>
                            </div>
                            <span className={styles.itemPrice}>₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderSummaryBlock}>
                        <div className={styles.summaryRow}>
                          <span>Payment Method:</span>
                          <strong>{order.paymentMethod}</strong>
                        </div>
                        <div className={styles.summaryRowTotal}>
                          <span>Grand Total:</span>
                          <span>₹{Math.round(order.total).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeView === 'catalog') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.headerRow}>
          <button onClick={() => setActiveView('dashboard')} className={styles.backButton}>
            <ChevronLeft size={14} />
            <span>Dashboard Menu</span>
          </button>
          <h1 className={styles.subTitle}>
            CATALOG<br />
            <span className="text-gold-gradient">EDITOR.</span>
          </h1>

          <button 
            onClick={() => setShowAddModal(true)} 
            className={styles.btnAddProduct}
            style={{ marginLeft: 'auto', marginRight: '16px' }}
          >
            <Plus size={14} style={{ marginRight: '6px' }} />
            <span>Add New Product</span>
          </button>

          <button onClick={handleLogout} className={styles.logoutButton} id="admin-logout-btn">
            Logout
          </button>
        </div>

        {successMessage && (
          <div className={styles.successToast} id="catalog-success-message">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {showAddModal && (
          <div className={styles.modalOverlay}>
            <GlassCard className={styles.modalContent} hoverGlow={false} expandOnHover={false}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Add Premium Catalog Item</h3>
                <button onClick={() => setShowAddModal(false)} className={styles.btnCloseModal}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Goat Ribs"
                      className={styles.formInput}
                      value={newProductForm.name}
                      onChange={(e) => handleAddFormChange('name', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Unique Slug/ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. premium_goat_ribs"
                      className={styles.formInput}
                      value={newProductForm.id}
                      onChange={(e) => handleAddFormChange('id', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category *</label>
                    <select
                      className={styles.formSelect}
                      value={newProductForm.category}
                      onChange={(e) => handleAddFormChange('category', e.target.value)}
                    >
                      <option value="Chicken">Chicken</option>
                      <option value="Mutton">Mutton</option>
                      <option value="Fish">Fish</option>
                      <option value="Eggs">Eggs</option>
                      <option value="Add-ons">Add-ons</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 350"
                      className={styles.formInput}
                      value={newProductForm.price}
                      onChange={(e) => handleAddFormChange('price', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Initial Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      className={styles.formInput}
                      value={newProductForm.stock}
                      onChange={(e) => handleAddFormChange('stock', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <label className={styles.formLabel} style={{ alignSelf: 'flex-start' }}>Product Image</label>
                    <div className={styles.modalImageWrapper}>
                      <div className={styles.modalImageContainer}>
                        <img
                          src={newProductForm.image || '/images/placeholder.png'}
                          className={styles.modalPreviewImage}
                          alt="Product Preview"
                          onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                        />
                        <div className={styles.modalImageOverlay} onClick={() => document.getElementById('modal-image-upload').click()}>
                          <Camera size={18} />
                          <span>ADD PHOTO</span>
                        </div>
                      </div>
                      {newProductForm.image && (
                        <button
                          type="button"
                          className={styles.modalBtnRemovePhoto}
                          onClick={() => handleAddFormChange('image', '')}
                          title="Remove Photo"
                        >
                          <X size={12} />
                        </button>
                      )}
                      <input
                        type="file"
                        id="modal-image-upload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            alert("Image is too large. Please select an image under 2MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            handleAddFormChange('image', uploadEvent.target.result);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Weight / Quantity Variants (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 250g, 500g, 1kg"
                    className={styles.formInput}
                    value={newProductForm.weightVariants}
                    onChange={(e) => handleAddFormChange('weightVariants', e.target.value)}
                  />
                  <small className={styles.formHelp}>Comma-separated values representing purchasable sizes.</small>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Product Description</label>
                  <textarea
                    placeholder="Describe the freshness, prep cuts, packaging etc."
                    className={styles.formTextarea}
                    rows="3"
                    value={newProductForm.description}
                    onChange={(e) => handleAddFormChange('description', e.target.value)}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowAddModal(false)} className={styles.btnModalCancel}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnModalSubmit}>
                    Add Product
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        <GlassCard className={styles.bulkAdjustmentCard} hoverGlow={false} expandOnHover={false}>
          <div className={styles.bulkHeader}>
            <h4 className={styles.bulkTitle}>Bulk Price Adjustment</h4>
            <p className={styles.bulkDesc}>Apply a percentage increase or decrease to the pricing inputs of all items.</p>
          </div>
          <div className={styles.bulkControls}>
            <div className={styles.percentInputWrapper}>
              <input
                type="number"
                placeholder="Percentage (e.g. 10)"
                value={bulkPercent}
                onChange={(e) => setBulkPercent(e.target.value)}
                className={styles.bulkPercentInput}
                min="0.01"
                step="0.01"
              />
              <span className={styles.percentSymbol}>%</span>
            </div>
            <button onClick={() => handleBulkAdjustment('increase')} className={styles.btnBulkAdjustIncrease}>
              <TrendingUp size={14} style={{ marginRight: '6px' }} />
              <span>Increase All Prices</span>
            </button>
            <button onClick={() => handleBulkAdjustment('decrease')} className={styles.btnBulkAdjustDecrease}>
              <TrendingDown size={14} style={{ marginRight: '6px' }} />
              <span>Decrease All Prices</span>
            </button>
          </div>
        </GlassCard>

        {loadingProducts ? (
          <div className={styles.panelLoading}>
            <div className={styles.spinner}>
              <div className={styles.doubleSpinner1}></div>
              <div className={styles.doubleSpinner2}></div>
            </div>
            <p className={styles.loadingText} style={{ marginTop: '16px' }}>RETRIEVING PRODUCT RECORDS...</p>
          </div>
        ) : productsError ? (
          <div className={styles.errorMessage}>
            <span>{productsError}</span>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <Database size={36} className="text-gold" />
            <p className={styles.emptyText}>No products found in the database.</p>
          </div>
        ) : (
          <div className={styles.catalogWrapper}>
            <div className={styles.catalogList}>
              {products.map((product) => {
                const draft = drafts[product.id] || {};
                const currentName = draft.name !== undefined ? draft.name : product.name;
                const currentImage = draft.image !== undefined ? draft.image : product.image;
                const currentPrice = draft.price !== undefined ? draft.price : product.price;
                const currentStock = draft.stock !== undefined ? draft.stock : product.stock;
                const currentAvailability = draft.availability !== undefined ? draft.availability : product.availability;
                
                const isModified = 
                  draft.name !== undefined || 
                  draft.image !== undefined || 
                  draft.price !== undefined || 
                  draft.stock !== undefined || 
                  draft.availability !== undefined;

                return (
                  <GlassCard key={product.id} className={`${styles.catalogProductRow} ${isModified ? styles.rowModified : ''}`} hoverGlow={false} expandOnHover={false}>
                    {/* Left Column: Image preview and badges */}
                    <div className={styles.leftCol}>
                      <div className={styles.prodInfoBlock}>
                        <div className={styles.editableImageContainer}>
                          <img
                            src={currentImage || '/images/placeholder.png'}
                            className={styles.prodImage}
                            alt={currentName}
                            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                          />
                          <div className={styles.imageOverlay} onClick={() => triggerImageUpload(product.id)}>
                            <Camera size={16} />
                            <span>CHANGE</span>
                          </div>
                          {currentImage && (
                            <button
                              type="button"
                              className={styles.btnRemovePhoto}
                              onClick={() => handleFieldChange(product.id, 'image', '')}
                              title="Remove Photo"
                            >
                              <X size={10} />
                            </button>
                          )}
                          <input
                            type="file"
                            id={`image-upload-${product.id}`}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(product.id, e)}
                          />
                        </div>
                        <div className={styles.prodBadges}>
                          <span className={styles.categoryBadge}>{product.category}</span>
                        </div>
                      </div>
                      <div className={styles.originalInfoCol}>
                        <span className={styles.labelMuted}>Original DB Record</span>
                        <div className={styles.originalStats}>
                          <span className={styles.statTruncate} title={product.name}>Name: {product.name}</span>
                          <span className={styles.statTruncate} title={product.image}>Image: {product.image}</span>
                          <span>Price: ₹{product.price}</span>
                          <span>Stock: {product.stock} | {product.availability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Editable form inputs */}
                    <div className={styles.rightCol}>
                      <div className={styles.editorFieldFull}>
                        <label className={styles.fieldLabel}>Product Name</label>
                        <input
                          type="text"
                          className={styles.editorInputField}
                          value={currentName}
                          onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                        />
                      </div>

                      <div className={styles.editorFieldsRow}>
                        <div className={styles.editorField}>
                          <label className={styles.fieldLabel}>Price (₹)</label>
                          <input
                            type="number"
                            className={styles.editorInputField}
                            value={currentPrice}
                            min="0"
                            onChange={(e) => handleFieldChange(product.id, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>

                        <div className={styles.editorField}>
                          <label className={styles.fieldLabel}>Stock Qty</label>
                          <input
                            type="number"
                            className={styles.editorInputField}
                            value={currentStock}
                            min="0"
                            onChange={(e) => handleFieldChange(product.id, 'stock', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>

                        <div className={styles.editorField}>
                          <label className={styles.fieldLabel}>Stock Status</label>
                          <button
                            onClick={() => handleFieldChange(product.id, 'availability', currentAvailability === 'In Stock' ? 'Out of Stock' : 'In Stock')}
                            className={`${styles.toggleBtn} ${currentAvailability === 'In Stock' ? styles.toggleInStock : styles.toggleOutOfStock}`}
                          >
                            {currentAvailability === 'In Stock' ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className={styles.btnRowDelete}
                          title="Remove Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            <div className={styles.editorActionsBar}>
              <button
                onClick={handleSaveChanges}
                disabled={savingProducts || Object.keys(drafts).length === 0}
                className={styles.btnSaveCatalog}
              >
                <Save size={14} style={{ marginRight: '6px' }} />
                <span>{savingProducts ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleCancelChanges}
                disabled={savingProducts || Object.keys(drafts).length === 0}
                className={styles.btnCancelCatalog}
              >
                <X size={14} style={{ marginRight: '6px' }} />
                <span>Cancel Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs section */}
        <div className={styles.auditLogsSection}>
          <h3 className={styles.sectionHeading}>Price Change Audit Logs</h3>
          {priceLogs.length === 0 ? (
            <p className={styles.auditEmpty}>No price modifications logged yet.</p>
          ) : (
            <div className={styles.auditLogsTableWrapper}>
              <table className={styles.auditLogsTable}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Previous Price</th>
                    <th>New Price</th>
                    <th>Admin Username</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {priceLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.productName}</td>
                      <td className={styles.auditOldPrice}>₹{log.prevPrice.toLocaleString('en-IN')}</td>
                      <td className={styles.auditNewPrice}>₹{log.newPrice.toLocaleString('en-IN')}</td>
                      <td className={styles.auditUser}>{log.adminUsername}</td>
                      <td className={styles.auditTime}>
                        {new Date(log.dateTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeaderRow}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>
          ADMIN<br />
          <span className="text-gold-gradient">ADMIN PANEL.</span>
        </h1>
        
        <button onClick={handleLogout} className={styles.logoutButton} id="admin-logout-btn-dash">
          Logout
        </button>
      </div>

      <div className={styles.adminGrid}>
        {/* Statistics Cards */}
        <GlassCard 
          className={styles.adminCard} 
          onClick={() => setActiveView('orders')}
          style={{ cursor: 'pointer' }}
        >
          <ShoppingBag size={24} className="text-gold" />
          <h3 className={styles.cardTitle}>Orders Management</h3>
          <p className={styles.cardDesc}>View and update order processing and cold chain shipping status logs.</p>
          <span className={styles.cardStatus} style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Manage Active Orders →</span>
        </GlassCard>

        <GlassCard 
          className={styles.adminCard}
          onClick={() => setActiveView('catalog')}
          style={{ cursor: 'pointer' }}
        >
          <Database size={24} className="text-gold" />
          <h3 className={styles.cardTitle}>Catalog Editor</h3>
          <p className={styles.cardDesc}>Add premium meat cuts, modify prices, and manage cold chain stock quantities.</p>
          <span className={styles.cardStatus} style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Manage Catalog →</span>
        </GlassCard>

        <GlassCard className={styles.adminCard}>
          <Users size={24} className="text-gold" />
          <h3 className={styles.cardTitle}>User Profiles</h3>
          <p className={styles.cardDesc}>Manage VIP customer roles and check verified organic email accounts.</p>
          <span className={styles.cardStatus}>Active Records</span>
        </GlassCard>

        <GlassCard className={styles.adminCard}>
          <Settings size={24} className="text-gold" />
          <h3 className={styles.cardTitle}>System Configuration</h3>
          <p className={styles.cardDesc}>Control API limits, global shipping options, and OAuth key overrides.</p>
          <span className={styles.cardStatus}>Online</span>
        </GlassCard>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className={styles.pageWrapper}>
      <title>Admin Dashboard — AL-QURAISH</title>
      {/* Background Ambience removed in favor of global AtmosphericBackground */}

      <ParticleField
        particleCount={25}
        color="rgba(212, 175, 55, 0.1)"
        speed={0.12}
        maxSize={1.2}
      />

      <Navigation />

      <main className="container" style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: '80vh' }}>
        <Suspense fallback={
          <div className={styles.loadingScreen}>
            <p className={styles.loadingText}>SECURE CONNECTING...</p>
          </div>
        }>
          <AdminDashboardContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
