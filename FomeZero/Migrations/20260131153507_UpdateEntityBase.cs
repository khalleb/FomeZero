using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FomeZero.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntityBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateRegistration",
                table: "Customers",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Customers");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Customers",
                newName: "DateRegistration");
        }
    }
}
