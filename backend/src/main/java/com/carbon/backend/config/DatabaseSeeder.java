package com.carbon.backend.config;

import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.EmissionFactorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class DatabaseSeeder {

    @Bean
    public CommandLineRunner seedDatabase(EmissionFactorRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                EmissionFactor car = new EmissionFactor();
                car.setCategory("Transport");
                car.setActivityType("Car");
                car.setUnit("km");
                car.setKgCo2PerUnit(0.192);

                EmissionFactor flight = new EmissionFactor();
                flight.setCategory("Transport");
                flight.setActivityType("Flight");
                flight.setUnit("km");
                flight.setKgCo2PerUnit(0.25);

                EmissionFactor transit = new EmissionFactor();
                transit.setCategory("Transport");
                transit.setActivityType("Public Transit");
                transit.setUnit("km");
                transit.setKgCo2PerUnit(0.04);

                EmissionFactor grid = new EmissionFactor();
                grid.setCategory("Electricity");
                grid.setActivityType("Grid");
                grid.setUnit("kWh");
                grid.setKgCo2PerUnit(0.4);

                EmissionFactor meat = new EmissionFactor();
                meat.setCategory("Food");
                meat.setActivityType("Meat Meal");
                meat.setUnit("servings");
                meat.setKgCo2PerUnit(3.3);

                EmissionFactor vegan = new EmissionFactor();
                vegan.setCategory("Food");
                vegan.setActivityType("Vegan Meal");
                vegan.setUnit("servings");
                vegan.setKgCo2PerUnit(0.5);

                EmissionFactor clothes = new EmissionFactor();
                clothes.setCategory("Shopping");
                clothes.setActivityType("Clothes");
                clothes.setUnit("usd");
                clothes.setKgCo2PerUnit(0.5);

                EmissionFactor bike = new EmissionFactor();
                bike.setCategory("Transport");
                bike.setActivityType("Bike");
                bike.setUnit("km");
                bike.setKgCo2PerUnit(0.0);

                repo.saveAll(List.of(car, flight, transit, grid, meat, vegan, clothes, bike));
            }
        };
    }
}
