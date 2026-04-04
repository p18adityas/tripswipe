import type { Schema, Struct } from '@strapi/strapi';

export interface PlaceCostEstimate extends Struct.ComponentSchema {
  collectionName: 'components_place_cost_estimates';
  info: {
    description: 'Price range for a place';
    displayName: 'Cost Estimate';
  };
  attributes: {
    currency: Schema.Attribute.Enumeration<
      ['USD', 'EUR', 'GBP', 'INR', 'NZD', 'AUD', 'JPY', 'THB', 'SGD', 'AED']
    > &
      Schema.Attribute.DefaultTo<'USD'>;
    max_price: Schema.Attribute.Decimal;
    min_price: Schema.Attribute.Decimal;
    price_note: Schema.Attribute.String;
  };
}

export interface PlaceLocationDetails extends Struct.ComponentSchema {
  collectionName: 'components_place_location_details';
  info: {
    description: 'Geographic coordinates and address for a place';
    displayName: 'Location Details';
  };
  attributes: {
    address: Schema.Attribute.Text;
    google_maps_url: Schema.Attribute.String;
    latitude: Schema.Attribute.Float;
    longitude: Schema.Attribute.Float;
  };
}

export interface PlaceOperatingHours extends Struct.ComponentSchema {
  collectionName: 'components_place_operating_hours';
  info: {
    description: 'Opening and closing times for a place';
    displayName: 'Operating Hours';
  };
  attributes: {
    close: Schema.Attribute.Time;
    closed_days: Schema.Attribute.JSON;
    notes: Schema.Attribute.String;
    open: Schema.Attribute.Time;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'place.cost-estimate': PlaceCostEstimate;
      'place.location-details': PlaceLocationDetails;
      'place.operating-hours': PlaceOperatingHours;
    }
  }
}
